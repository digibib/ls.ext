package no.deichman.services;

import com.hp.hpl.jena.rdf.model.Model;
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.JsonNode;
import com.mashape.unirest.http.Unirest;
import com.mashape.unirest.request.GetRequest;
import com.mashape.unirest.request.body.RequestBodyEntity;
import javax.json.Json;
import javax.json.JsonArray;
import javax.json.JsonArrayBuilder;
import javax.json.JsonObjectBuilder;
import javax.ws.rs.core.Response.Status;
import no.deichman.services.kohaadapter.KohaSvcMock;
import no.deichman.services.rdf.RDFModelUtil;
import no.deichman.services.testutil.PortSelector;
import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFFormat;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.CoreMatchers.notNullValue;
import static org.hamcrest.CoreMatchers.startsWith;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.assertTrue;

public class AppTest {

    private static final boolean USE_IN_MEMORY_REPO = true;
    private static final String LOCALHOST = "http://127.0.0.1";
    public static final String BIBLIO_ID = "666";
    private String baseUri;
    private App app;

    private KohaSvcMock kohaSvcMock;

    @Before
    public void setUp() throws Exception {
        int appPort = PortSelector.randomFree();
        baseUri = LOCALHOST + ":" + appPort + "/";
        System.setProperty("DATA_BASEURI", baseUri);
        kohaSvcMock = new KohaSvcMock();
        String svcEndpoint = LOCALHOST + ":" + kohaSvcMock.getPort();
        app = new App(appPort, svcEndpoint, USE_IN_MEMORY_REPO);
        app.startAsync();
    }

    @After
    public void tearDown() throws Exception {
        app.stop();
    }

    @Test
    public void happy_day_scenario() throws Exception {

        kohaSvcMock.addLoginExpectation();
        kohaSvcMock.addPostNewBiblioExpectation(BIBLIO_ID);

        final HttpResponse<JsonNode> createPublicationResponse = buildCreateRequest(baseUri + "publication").asJson();

        assertResponse(Status.CREATED, createPublicationResponse);
        final String publicationUri = getLocation(createPublicationResponse);
        assertIsUri(publicationUri);
        assertThat(publicationUri, startsWith(baseUri));

        final HttpResponse<JsonNode> createWorkResponse = buildCreateRequest(baseUri + "work").asJson();

        assertResponse(Status.CREATED, createWorkResponse);
        final String workUri = getLocation(createWorkResponse);
        assertIsUri(workUri);
        assertThat(workUri, startsWith(baseUri));

        final JsonArray workIntoPublicationPatch = buildLDPatch(buildPatchStatement("add", publicationUri, baseUri + "ontology#publicationOf", workUri));

        final HttpResponse<String> patchWorkIntoPublicationResponse = buildPatchRequest(publicationUri, workIntoPublicationPatch).asString();
        assertResponse(Status.OK, patchWorkIntoPublicationResponse);

        final HttpResponse<JsonNode> getWorkResponse = buildGetRequest(workUri).asJson();

        assertResponse(Status.OK, getWorkResponse);
        final JsonNode work = getWorkResponse.getBody();
        assertThat(work, notNullValue());

        final Model workModel = RDFModelUtil.modelFrom(work.toString(), Lang.JSONLD);
        System.out.println(RDFModelUtil.stringFrom(workModel, RDFFormat.TURTLE_FLAT));

        // TODO extend test
        // add item to mock Koha
        //kohaSvcMock.addGetBiblioExpectation(BIBLIO_ID, );
        //final HttpResponse<String> getWorkItemsResponse =
        buildGetItemsRequest(workUri).asString();

        //assertResponse(Status.OK, getWorkItemsResponse);

        //final Model workItemsModel = RDFModelUtil.modelFrom(work.toString(), Lang.JSONLD);
        // System.out.println(RDFModelUtil.stringFrom(workItemsModel, RDFFormat.TURTLE_FLAT));
        // assert one of each
        // add another item
        // assert two items
        // add another publication
        // assert two items and two publications
        // add another item to second publication
        // assert three items and two publications

    }

    private GetRequest buildGetItemsRequest(String workUri) {
        return Unirest
                .get(workUri + "/items")
                .header("Accept", "application/ld+json");
    }

    private GetRequest buildGetRequest(String workUri) {
        return Unirest
                .get(workUri)
                .header("Accept", "application/ld+json");
    }

    private static JsonObjectBuilder buildPatchStatement(String op, String s, String p, String o) {
        return Json.createObjectBuilder()
                .add("op", op).add("s", s).add("p", p).add("o", Json.createObjectBuilder().add("value", o));
    }

    private static JsonArray buildLDPatch(JsonObjectBuilder... patchStatements) {
        JsonArrayBuilder patchBuilder = Json.createArrayBuilder();
        for (JsonObjectBuilder patchStatement : patchStatements) {
            patchBuilder.add(patchStatement);
        }
        return patchBuilder.build();
    }

    private static String getLocation(HttpResponse<?> response) {
        return response.getHeaders().getFirst("Location");
    }

    private static RequestBodyEntity buildPatchRequest(String uri, JsonArray patch) {
        return Unirest
                    .patch(uri)
                    .header("Accept", "application/ld+json")
                    .header("Content-Type", "application/ldpatch+json")
                    .body(new JsonNode(patch.toString()));
    }

    private static void assertIsUri(String uri) {
        assertTrue("Not a URI: " + uri, uri.matches("(?:http|https)(?::\\/{2}[\\w]+)(?:[\\/|\\.]?)(?:[^\\s]*)"));
    }

    private static void assertResponse(Status status, HttpResponse<?> response) {
        assertThat("Unexpected response: " + response.getBody(),
                Status.fromStatusCode(response.getStatus()),
                equalTo(status)
        );
    }

    private static RequestBodyEntity buildCreateRequest(String uri) {
        return Unirest
                .post(uri)
                .header("Accept", "application/ld+json")
                .header("Content-Type", "application/ld+json")
                .body("{}");
    }

}
