package no.deichman.services;

import com.hp.hpl.jena.query.QueryExecution;
import com.hp.hpl.jena.query.QueryExecutionFactory;
import com.hp.hpl.jena.query.QueryFactory;
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
    public static final String FIRST_BIBLIO_ID = "111111";
    public static final String SECOND_BIBLIO_ID = "222222";
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
        kohaSvcMock.addPostNewBiblioExpectation(FIRST_BIBLIO_ID);

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

        final QueryExecution workPublicationLink = QueryExecutionFactory.create(
                QueryFactory.create(
                        "PREFIX deichman: <" + baseUri + "ontology#>"
                                + "ASK { "
                                + "<" + workUri + "> a deichman:Work ."
                                + "<" + publicationUri + "> a deichman:Publication ."
                                + "<" + publicationUri + "> deichman:publicationOf \"" + workUri + "\" ."
                                + "}"), workModel);
        assertTrue("model does not have a publication of work", workPublicationLink.execAsk());

        // One publication with one item
        kohaSvcMock.addLoginExpectation();
        kohaSvcMock.addGetBiblioExpectation(FIRST_BIBLIO_ID, 1);
        final HttpResponse<JsonNode> getWorkItemsResponse = buildGetItemsRequest(workUri).asJson();

        assertResponse(Status.OK, getWorkItemsResponse);

        final JsonNode workItems = getWorkItemsResponse.getBody();
        final Model workItemsModel = RDFModelUtil.modelFrom(workItems.toString(), Lang.JSONLD);

        final QueryExecution publicationItemLink = QueryExecutionFactory.create(
                QueryFactory.create(
                        "PREFIX deichman: <" + baseUri + "ontology#>"
                                + "ASK { "
                                + "?item a deichman:Item ."
                                + "<" + publicationUri + "> deichman:hasEdition (?item) ."
                                + "}"), workItemsModel);
        assertTrue("model does not have a publication with an item", publicationItemLink.execAsk());

        // One publication with two items
        kohaSvcMock.addGetBiblioExpectation(FIRST_BIBLIO_ID, 2);

        final HttpResponse<JsonNode> getWorkWith2ItemsResponse = buildGetItemsRequest(workUri).asJson();
        final JsonNode work2Items = getWorkWith2ItemsResponse.getBody();
        final Model work2ItemsModel = RDFModelUtil.modelFrom(work2Items.toString(), Lang.JSONLD);

        final QueryExecution work2ItemsLink = QueryExecutionFactory.create(
                QueryFactory.create(
                        "PREFIX deichman: <" + baseUri + "ontology#>"
                                + "SELECT (COUNT (?item) AS ?noOfItems) { "
                                + "?item a deichman:Item ."
                                + "<" + publicationUri + "> deichman:hasEdition (?item) ."
                                + "}"), work2ItemsModel);
        assertThat("model does not have a publication with two items",
                work2ItemsLink.execSelect().next().getLiteral("noOfItems").getInt(),
                equalTo(2));

        // Two publications on one work
        kohaSvcMock.addPostNewBiblioExpectation(SECOND_BIBLIO_ID);
        final HttpResponse<JsonNode> createSecondPublicationResponse = buildCreateRequest(baseUri + "publication").asJson();
        assertResponse(Status.CREATED, createSecondPublicationResponse);
        final String secondPublicationUri = getLocation(createSecondPublicationResponse);

        final JsonArray workIntoSecondPublicationPatch = buildLDPatch(buildPatchStatement("add", secondPublicationUri, baseUri + "ontology#publicationOf", workUri));
        final HttpResponse<String> patchWorkIntoSecondPublicationResponse = buildPatchRequest(secondPublicationUri, workIntoSecondPublicationPatch).asString();
        assertResponse(Status.OK, patchWorkIntoSecondPublicationResponse);

        final HttpResponse<JsonNode> getWorkWithTwoPublications = buildGetRequest(workUri).asJson();

        assertResponse(Status.OK, getWorkWithTwoPublications);
        final JsonNode workWith2Publications = getWorkWithTwoPublications.getBody();
        assertThat(workWith2Publications, notNullValue());

        final Model workWith2PublicationsModel = RDFModelUtil.modelFrom(workWith2Publications.toString(), Lang.JSONLD);

        final QueryExecution workWith2PublicationsCount = QueryExecutionFactory.create(
                QueryFactory.create(
                        "PREFIX deichman: <" + baseUri + "ontology#>"
                                + "SELECT (COUNT (?publication) AS ?noOfPublications) { "
                                + "<" + workUri + "> a deichman:Work ."
                                + "?publication a deichman:Publication ."
                                + "?publication deichman:publicationOf \"" + workUri + "\" ."
                                + "}"), workWith2PublicationsModel);
        assertThat("model does not have a work with two publications",
                workWith2PublicationsCount.execSelect().next().getLiteral("noOfPublications").getInt(),
                equalTo(2));

        // Two publications with one item each

        kohaSvcMock.addGetBiblioExpectation(FIRST_BIBLIO_ID, 2);
        kohaSvcMock.addGetBiblioExpectation(SECOND_BIBLIO_ID, 1);

        final HttpResponse<JsonNode> getWorkWith2Plus1ItemsResponse = buildGetItemsRequest(workUri).asJson();
        final JsonNode work1Plus2Items = getWorkWith2Plus1ItemsResponse.getBody();
        final Model work1Plus2ItemsModel = RDFModelUtil.modelFrom(work1Plus2Items.toString(), Lang.JSONLD);
        System.out.println(RDFModelUtil.stringFrom(work1Plus2ItemsModel, RDFFormat.TURTLE_PRETTY));

        final QueryExecution workWith1Plus2ItemsCount = QueryExecutionFactory.create(
                QueryFactory.create(
                        "PREFIX deichman: <" + baseUri + "ontology#>"
                                + "SELECT (COUNT (?item) AS ?noOfItems) { "
                                + "?item a deichman:Item ."
                                + "}"), work1Plus2ItemsModel);
        assertThat("model does not three publications",
                workWith1Plus2ItemsCount.execSelect().next().getLiteral("noOfItems").getInt(),
                equalTo(2 + 1));
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
