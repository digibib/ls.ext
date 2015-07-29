package no.deichman.services.kohaadapter;

import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;
import org.marc4j.MarcReader;
import org.marc4j.MarcXmlReader;
import org.marc4j.marc.Record;

import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.Entity;
import javax.ws.rs.client.Invocation;
import javax.ws.rs.client.WebTarget;
import javax.ws.rs.core.Form;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.NewCookie;
import javax.ws.rs.core.Response;
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

    private final String kohaPort;

    private NewCookie sessionCookie;

    KohaAdapterImpl(String kohaPort) {
        this.kohaPort = kohaPort;
        System.out.println("Koha adapter started with kohaPort: " + kohaPort);
    }

    public KohaAdapterImpl() {
        this(System.getProperty("KOHA_PORT", DEFAULT_KOHA_PORT));
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
            System.out.println(response);
            throw new IllegalStateException("Cannot authenticate with Koha: " + response + ", sessionCookie: " + sessionCookie);
        }
    }

    @Override
    public Model getBiblio(String id) {
        // TODO Handle login in a filter / using template pattern
        if (sessionCookie == null) {
            login();
        }

        Response response = requestItems(id);
        // TODO Hack if we have timed out
        if (response.getStatus() == FORBIDDEN.getStatusCode()) {
            login();
            response = requestItems(id);
        }
        if (OK.getStatusCode() != response.getStatus()) {
            throw new RuntimeException("Unexpected response when requesting items: http status: " + response.getStatusInfo()); // FIXME !!
        }

        return mapMarcToModel(response.readEntity(String.class));
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
        System.out.println("DEBUG: Received marc from koha\n" + marc21Xml);
        InputStream in = new ByteArrayInputStream(marc21Xml.getBytes(StandardCharsets.UTF_8));
        MarcReader reader = new MarcXmlReader(in);
        Marc2Rdf marcRdf = new Marc2Rdf();
        while (reader.hasNext()) {
            Record record = reader.next();
            m.add(marcRdf.mapItemsToModel(record.getVariableFields("952")));
        }
        return m;
    }
}
