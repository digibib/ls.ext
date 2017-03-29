package no.deichman.services.entity.kohaadapter;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.Entity;
import javax.ws.rs.client.Invocation;
import javax.ws.rs.client.WebTarget;
import javax.ws.rs.core.Form;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.NewCookie;
import javax.ws.rs.core.Response;

import static javax.ws.rs.core.Response.Status.CREATED;
import static javax.ws.rs.core.Response.Status.FORBIDDEN;
import static javax.ws.rs.core.Response.Status.UNAUTHORIZED;
import static javax.ws.rs.core.Response.Status.OK;

/**
 * Responsibility: Handle creating and updating bibliographic records and items in Koha.
 */
public final class KohaAdapterImpl implements KohaAdapter {

    private static final String KOHA_USER = System.getProperty("KOHA_API_USER", "api");
    private static final String KOHA_PASSWORD = System.getProperty("KOHA_API_PASS", "secret");
    static final String SESSION_COOKIE_KEY = "CGISESSID";

    private final Logger log = LoggerFactory.getLogger(this.getClass());
    private final String kohaPort;

    private NewCookie sessionCookie;

    public KohaAdapterImpl(String kohaPort) {
        this.kohaPort = kohaPort != null ? kohaPort : System.getProperty("KOHA_PORT", "http://xkoha:8081");
        log.info("Koha adapter started with kohaPort: " + this.kohaPort);
    }

    KohaAdapterImpl() {
        this(null);
    }

    private void login() {
        log.info("Creating/Renewing sessions to Koha REST API");
        String url = kohaPort + "/api/v1/auth/session";

        Form form = new Form();
        form.param("userid", KOHA_USER);
        form.param("password", KOHA_PASSWORD);

        Response response = ClientBuilder.newClient()
                .target(url)
                .request()
                .post(Entity.entity(form, MediaType.APPLICATION_FORM_URLENCODED_TYPE));

        sessionCookie = response.getCookies() == null ? null : response.getCookies().get(SESSION_COOKIE_KEY);

        if (response.getStatus() != CREATED.getStatusCode() || sessionCookie == null) {
            String message = "Cannot authenticate with Koha: " + response + ", sessionCookie: " + sessionCookie;
            log.error(message);
            throw new IllegalStateException(message);
        }
    }

    @Override
    public Model getBiblio(String recordId) {
        return mapBiblioToModel(retrieveBiblioExpanded(recordId));
    }

    private Response requestBiblio(String id) {
        Client client = ClientBuilder.newClient();
        String url = kohaPort + "/api/v1/biblios/" + id;
        WebTarget webTarget = client.target(url);
        Invocation.Builder invocationBuilder = webTarget.request(MediaType.APPLICATION_JSON);
        invocationBuilder.cookie(sessionCookie.toCookie());
        return invocationBuilder.get();
    }

    private Response getCheckoutsFromAPI(String userId) {
        Client client = ClientBuilder.newClient();
        WebTarget webTarget = client.target(kohaPort + "/api/v1/checkouts?borrowernumber=" + userId);
        if (sessionCookie == null) {
            login();
        }
        Invocation.Builder invocationBuilder = webTarget.request(MediaType.APPLICATION_JSON);
        invocationBuilder.cookie(sessionCookie.toCookie());
        return invocationBuilder.get();
    }

    private Response requestExpandedBiblio(String id) {
        Client client = ClientBuilder.newClient();
        String url = kohaPort + "/api/v1/biblios/" + id + "/expanded";
        WebTarget webTarget = client.target(url);
        Invocation.Builder invocationBuilder = webTarget.request(MediaType.APPLICATION_JSON);
        invocationBuilder.cookie(sessionCookie.toCookie());
        return invocationBuilder.get();
    }

    private Model mapBiblioToModel(String response) {
        Model m = ModelFactory.createDefaultModel();
        KohaItem2Rdf itemRdf = new KohaItem2Rdf();
        JsonObject json = new Gson().fromJson(response, JsonObject.class);
        m.add(itemRdf.mapItemsToModel(json.getAsJsonArray("items")));
        return m;
    }

    private Response sendMarcRecord(String method, String url, MarcRecord marcRecord) {
        Client client = ClientBuilder.newClient();
        WebTarget webTarget = client.target(url);
        Invocation.Builder invocationBuilder = webTarget.request(MediaType.APPLICATION_FORM_URLENCODED);
        if (sessionCookie == null) {
            login();
        }
        invocationBuilder.cookie(sessionCookie.toCookie());
        invocationBuilder.header("framework", System.getenv("MARCFRAMEWORK"));
        switch (method) {
            case "POST":
                return invocationBuilder.post(Entity.entity(marcRecord.getMarcXml(), MediaType.TEXT_XML));
            case "PUT":
                return invocationBuilder.put(Entity.entity(marcRecord.getMarcXml(), MediaType.TEXT_XML));
            default:
                throw new RuntimeException("Expected method POST or PUT; got " + method);
        }

    }

    private Response deleteRecord(String url) {
        Client client = ClientBuilder.newClient();
        WebTarget webTarget = client.target(url);
        Invocation.Builder invocationBuilder = webTarget.request();
        if (sessionCookie == null) {
            login();
        }
        invocationBuilder.cookie(sessionCookie.toCookie());
        Response response = invocationBuilder.delete();
        if (response.getStatus() == FORBIDDEN.getStatusCode() || response.getStatus() == UNAUTHORIZED.getStatusCode()) {
            // Session has expired; try login again
            login();
            response = invocationBuilder.delete();
        }
        return response;
    }

    private Response requestNewRecord(MarcRecord marcRecord) {
        String url = kohaPort + "/api/v1/biblios";
        Response response = sendMarcRecord("POST", url, marcRecord);
        if (response.getStatus() == FORBIDDEN.getStatusCode() || response.getStatus() == UNAUTHORIZED.getStatusCode()) {
            // Session has expired; try login again
            login();
            response = sendMarcRecord("POST", url, marcRecord);
        }
        return response;
    }

    @Override
    public Response updateRecord(String recordId, MarcRecord marcRecord) {
        String url = kohaPort + "/api/v1/biblios/" + recordId;
        Response response = sendMarcRecord("PUT", url, marcRecord);
        if (response.getStatus() == FORBIDDEN.getStatusCode() || response.getStatus() == UNAUTHORIZED.getStatusCode()) {
            // Session has expired; try login again
            login();
            response = sendMarcRecord("PUT", url, marcRecord);
        }
        return response;
    }

    @Override
    public void deleteBiblio(String recordId) throws PublicationHasItemsException {
        String url = kohaPort + "/api/v1/biblios/" + recordId;
        JsonObject json = new Gson().fromJson(retrieveBiblioExpanded(recordId), JsonObject.class);
        int numberOfItems = json.getAsJsonArray("items").size();
        if (numberOfItems == 0) {
            deleteRecord(url);
        } else {
            throw new PublicationHasItemsException(numberOfItems);
        }
    }

    @Override
    public String getBiblioFromItemNumber(String itemNumber) {
        Client client = ClientBuilder.newClient();
        WebTarget webTarget = client.target(kohaPort + "/api/v1/items/" + itemNumber + "/biblio");
        if (sessionCookie == null) {
            login();
        }
        Invocation.Builder invocationBuilder = webTarget.request(MediaType.APPLICATION_JSON);
        invocationBuilder.cookie(sessionCookie.toCookie());
        Response response = invocationBuilder.get();
        return response.readEntity(String.class);
    }

    @Override
    public String getCheckouts(String userId) {
        Response response = getCheckoutsFromAPI(userId);
        return response.readEntity(String.class);
    }

    @Override
    public String getHolds(String userId) {
        Response response = getHoldsFromAPI(userId);
        return response.readEntity(String.class);
    }

    private Response getHoldsFromAPI(String userId) {
        Client client = ClientBuilder.newClient();
        WebTarget webTarget = client.target(kohaPort + "/api/v1/holds/?borrowernumber=" + userId);
        if (sessionCookie == null) {
            login();
        }
        Invocation.Builder invocationBuilder = webTarget.request(MediaType.APPLICATION_JSON);
        invocationBuilder.cookie(sessionCookie.toCookie());
        return invocationBuilder.get();
    }

    @Override
    public String createNewBiblio() {
        return createNewBiblioWithMarcRecord(new MarcRecord());
    }

    @Override
    public String createNewBiblioWithMarcRecord(MarcRecord marcRecord) {
        // TODO Handle login in a filter / using template pattern
        if (sessionCookie == null) {
            login();
        }

        Response response = requestNewRecord(marcRecord);
        if (response.getStatus() == FORBIDDEN.getStatusCode() || response.getStatus() == UNAUTHORIZED.getStatusCode()) {
            // Session has expired; try login again
            login();
            response = requestNewRecord(marcRecord);
        }
        if (CREATED.getStatusCode() != response.getStatus()) {
            throw new RuntimeException("Request new bibilo failed with HTTP status: " + response.getStatusInfo());
        }

        String location = response.getHeaderString("Location");
        if (location == null || location.lastIndexOf('/') == -1) {
            throw new RuntimeException("Could not get Koha biblionumber from Location header: " + response.toString());
        }

        String biblioId = location.substring(location.lastIndexOf('/') + 1);
        log.info("LOG: Koha created a new bibliographic record with ID: " + biblioId);

        return biblioId;
    }

    @Override
    public String retrieveBiblioExpanded(String recordId) {
        // TODO Handle login in a filter / using template pattern
        if (sessionCookie == null) {
            login();
        }

        Response response = requestExpandedBiblio(recordId);

        if (response.getStatus() == FORBIDDEN.getStatusCode() || response.getStatus() == UNAUTHORIZED.getStatusCode()) {
            // Session has expired; try login again
            login();
            response = requestExpandedBiblio(recordId);
        }
        if (OK.getStatusCode() != response.getStatus()) {
            throw new RuntimeException("Unexpected response when requesting expanded biblio: http status: " + response.getStatusInfo()); // FIXME !!
        }
        return response.readEntity(String.class);
    }

    @Override
    public String retrieveBiblioMARCXML(String recordId) {
        // TODO Handle login in a filter / using template pattern
        if (sessionCookie == null) {
            login();
        }

        Response response = requestBiblio(recordId);

        if (response.getStatus() == FORBIDDEN.getStatusCode() || response.getStatus() == UNAUTHORIZED.getStatusCode()) {
            // Session has expired; try login again
            login();
            response = requestBiblio(recordId);
        }
        if (OK.getStatusCode() != response.getStatus()) {
            throw new RuntimeException("Unexpected response when requesting biblio: http status:" + response.getStatusInfo()); // FIXME !!
        }
        return new Gson().fromJson(response.readEntity(String.class), JsonObject.class).get("marcxml").getAsString();
    }

}
