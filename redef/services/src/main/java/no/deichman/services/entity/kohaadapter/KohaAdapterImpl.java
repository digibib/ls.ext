package no.deichman.services.entity.kohaadapter;

import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.marc4j.MarcReader;
import org.marc4j.MarcXmlReader;
import org.marc4j.marc.Record;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.xml.sax.InputSource;

import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.Entity;
import javax.ws.rs.client.Invocation;
import javax.ws.rs.client.WebTarget;
import javax.ws.rs.core.Form;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.NewCookie;
import javax.ws.rs.core.Response;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathExpressionException;
import javax.xml.xpath.XPathFactory;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

import static javax.ws.rs.core.Response.Status.FORBIDDEN;
import static javax.ws.rs.core.Response.Status.OK;

/**
 * Responsibility: TODO.
 */
public final class KohaAdapterImpl implements KohaAdapter {

    private static final String DEFAULT_KOHA_PORT = "http://192.168.50.12:8081";
    private static final String KOHA_USER = System.getProperty("KOHA_USER", "admin");
    private static final String KOHA_PASSWORD = System.getProperty("KOHA_PASSWORD", "secret");
    public static final String SESSION_COOKIE_KEY = "CGISESSID";

    private final Logger log = LoggerFactory.getLogger(this.getClass());
    private final String kohaPort;

    private NewCookie sessionCookie;

    public KohaAdapterImpl(String kohaPort) {
        this.kohaPort = kohaPort != null ? kohaPort : System.getProperty("KOHA_PORT", DEFAULT_KOHA_PORT);
        log.info("Koha adapter started with kohaPort: " + this.kohaPort);
    }

    public KohaAdapterImpl() {
        this(null);
    }

    private void login() {
        String url = kohaPort + "/cgi-bin/koha/svc/authentication";

        Form form = new Form();
        form.param("userid", KOHA_USER);
        form.param("password", KOHA_PASSWORD);

        Response response = ClientBuilder.newClient()
                .target(url)
                .request()
                .post(Entity.entity(form, MediaType.APPLICATION_FORM_URLENCODED_TYPE));

        sessionCookie = response.getCookies() == null ? null : response.getCookies().get(SESSION_COOKIE_KEY);

        if (response.getStatus() != OK.getStatusCode() || sessionCookie == null) {
            String message = "Cannot authenticate with Koha: " + response + ", sessionCookie: " + sessionCookie;
            log.error(message);
            throw new IllegalStateException(message);
        }
    }

    @Override
    public Model getBiblio(String recordId) {
        return mapMarcToModel(getMarcXml(recordId));
    }

    private Response requestItems(String id) {
        Client client = ClientBuilder.newClient();
        String url = kohaPort + "/cgi-bin/koha/svc/bib/" + id + "?items=1";
        WebTarget webTarget = client.target(url);
        Invocation.Builder invocationBuilder = webTarget.request(MediaType.TEXT_XML);
        invocationBuilder.cookie(sessionCookie.toCookie());
        return invocationBuilder.get();
    }

    private Model mapMarcToModel(String marc21Xml) {
        Model m = ModelFactory.createDefaultModel();
        log.debug("Received marc from koha\n" + marc21Xml);
        InputStream in = new ByteArrayInputStream(marc21Xml.getBytes(StandardCharsets.UTF_8));
        MarcReader reader = new MarcXmlReader(in);
        Marc2Rdf marcRdf = new Marc2Rdf();
        while (reader.hasNext()) {
            Record record = reader.next();
            m.add(marcRdf.mapItemsToModel(record.getVariableFields(MarcConstants.FIELD_952)));
        }
        return m;
    }

    private Response postMarcRecord(String url, MarcRecord marcRecord) {
        MarcXmlProvider mxp = new MarcXmlProvider();
        mxp.createRecord();

        if (marcRecord != null) {
            mxp.addSubfield(MarcConstants.FIELD_245, marcRecord.fieldAsMap(MarcConstants.FIELD_245));
            mxp.addSubfield(MarcConstants.FIELD_952, marcRecord.fieldAsMap(MarcConstants.FIELD_952));
        }

        Client client = ClientBuilder.newClient();
        WebTarget webTarget = client.target(url);
        Invocation.Builder invocationBuilder = webTarget.request(MediaType.APPLICATION_FORM_URLENCODED);
        invocationBuilder.cookie(sessionCookie.toCookie());
        return invocationBuilder.post(Entity.entity(mxp.getMarcXml(), MediaType.TEXT_XML));
    }

    private Response requestNewRecord(MarcRecord marcRecord) {
        String url = kohaPort + "/cgi-bin/koha/svc/new_bib" + (marcRecord != null && !marcRecord.isEmpty() ? "?items=1" : "");
        return postMarcRecord(url, marcRecord);
    }

    @Override
    public Response updateRecord(String recordId, MarcRecord marcRecord) {
        String url = kohaPort + "/cgi-bin/koha/svc/bib/" + recordId + "?items=0";
        return postMarcRecord(url, marcRecord);
    }

    @Override
    public String getNewBiblio() {
        return getNewBiblioWithItems(null); // empty argument list
    }

    @Override
    public String getNewBiblioWithItems(MarcRecord marcRecord) {
        // TODO Handle login in a filter / using template pattern
        if (sessionCookie == null) {
            login();
        }

        Response response = requestNewRecord(marcRecord);
        // TODO Hack if we have timed out
        if (response.getStatus() == FORBIDDEN.getStatusCode()) {
            login();
            response = requestNewRecord(marcRecord);
        }
        if (OK.getStatusCode() != response.getStatus()) {
            throw new RuntimeException("Unexpected response when requesting items: http status: " + response.getStatusInfo()); // FIXME !!
        }

        String body = response.readEntity(String.class);
        InputSource inputSource = new InputSource(new ByteArrayInputStream(body.getBytes(StandardCharsets.ISO_8859_1)));
        XPath xpath = XPathFactory.newInstance().newXPath();
        String biblioId;
        try {
            biblioId = xpath.evaluate("//response/biblionumber", inputSource);
        } catch (XPathExpressionException e) {
            throw new RuntimeException("Could not get biblionumber from Koha response: " + body);
        }

        if (biblioId == null || "".equals(biblioId)) {
            log.error("Koha failed to create a new bibliographic record");
            throw new RuntimeException("Koha connection for new biblio failed, missing biblioId");
        } else {
            log.info("LOG: Koha created a new bibliographic record with ID: " + biblioId);
        }

        return biblioId;
    }

    @Override
    public String getMarcXml(String recordId) {
        // TODO Handle login in a filter / using template pattern
        if (sessionCookie == null) {
            login();
        }

        log.info("Attempting to retrieve " + recordId + " from Koha SVC");
        Response response = requestItems(recordId);
        // TODO Hack if we have timed out
        if (response.getStatus() == FORBIDDEN.getStatusCode()) {
            login();
            response = requestItems(recordId);
        }
        if (OK.getStatusCode() != response.getStatus()) {
            throw new RuntimeException("Unexpected response when requesting items: http status: " + response.getStatusInfo()); // FIXME !!
        }
        return response.readEntity(String.class);
    }

}
