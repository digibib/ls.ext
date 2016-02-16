package no.deichman.services.services;

import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.JsonNode;
import com.mashape.unirest.http.Unirest;
import com.mashape.unirest.http.exceptions.UnirestException;
import com.mashape.unirest.request.GetRequest;
import com.mashape.unirest.request.HttpRequest;
import com.mashape.unirest.request.body.RequestBodyEntity;
import no.deichman.services.App;
import no.deichman.services.entity.kohaadapter.KohaSvcMock;
import no.deichman.services.rdf.RDFModelUtil;
import no.deichman.services.restutils.MimeType;
import no.deichman.services.services.search.EmbeddedElasticsearchServer;
import no.deichman.services.testutil.PortSelector;
import org.apache.jena.query.QueryExecution;
import org.apache.jena.query.QueryExecutionFactory;
import org.apache.jena.query.QueryFactory;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Statement;
import org.apache.jena.riot.Lang;
import org.apache.jena.vocabulary.RDFS;
import org.elasticsearch.client.Client;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Ignore;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.json.Json;
import javax.json.JsonArray;
import javax.json.JsonArrayBuilder;
import javax.json.JsonObjectBuilder;
import javax.ws.rs.core.Response.Status;
import java.io.IOException;

import static java.net.HttpURLConnection.HTTP_OK;
import static org.apache.jena.rdf.model.ResourceFactory.createLangLiteral;
import static org.apache.jena.rdf.model.ResourceFactory.createProperty;
import static org.apache.jena.rdf.model.ResourceFactory.createResource;
import static org.apache.jena.rdf.model.ResourceFactory.createStatement;
import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.CoreMatchers.notNullValue;
import static org.hamcrest.CoreMatchers.startsWith;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

public class AppTest {
    public static final int ONE_SECOND = 1000;
    public static final int ZERO = 0;
    public static final int ONE = 1;
    public static final int TWO = 2;
    public static final int THREE = 3;
    public static final int FOUR = 4;
    public static final int FIVE = 5;
    public static final int TEN_TIMES = 10;
    public static final int FIFTY_TIMES = 50;
    public static final boolean SHOULD_NOT_FIND = true;
    private static final Logger LOG = LoggerFactory.getLogger(AppTest.class);
    private static final boolean USE_IN_MEMORY_REPO = true;
    private static final String LOCALHOST = "http://127.0.0.1";
    private static final String FIRST_BIBLIO_ID = "111111";
    private static final String SECOND_BIBLIO_ID = "222222";
    private static final String ANY_URI = "http://www.w3.org/2001/XMLSchema#anyURI";
    private static final String ANOTHER_BIBLIO_ID = "333333";
    private static String baseUri;
    private static App app;

    private static KohaSvcMock kohaSvcMock;
    private static EmbeddedElasticsearchServer embeddedElasticsearchServer;


    @BeforeClass
    public static void setUp() throws Exception {
        int appPort = PortSelector.randomFree();
        int jamonAppPort = PortSelector.randomFree();
        kohaSvcMock = new KohaSvcMock();
        String svcEndpoint = LOCALHOST + ":" + kohaSvcMock.getPort();
        baseUri = LOCALHOST + ":" + appPort + "/";
        System.setProperty("DATA_BASEURI", baseUri);
        app = new App(appPort, svcEndpoint, USE_IN_MEMORY_REPO, jamonAppPort);
        app.startAsync();

        setupElasticSearch();
    }

    private static void setupElasticSearch() throws Exception {
        embeddedElasticsearchServer = EmbeddedElasticsearchServer.getInstance();
    }

    @AfterClass
    public static void tearDown() throws Exception {
        app.stop();
        embeddedElasticsearchServer.shutdown();
    }

    private static JsonObjectBuilder buildPatchStatement(String op, String s, String p, String o, String type) {
        return Json.createObjectBuilder()
                .add("op", op).add("s", s).add("p", p).add("o", Json.createObjectBuilder().add("value", o).add("type", type));
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
        String str = response.getHeaders().getFirst("Location");
        return str;
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

    private static RequestBodyEntity buildEmptyCreateRequest(String uri) {
        return buildCreateRequest(uri, "{}");
    }

    private static RequestBodyEntity buildCreateRequestNtriples(String uri, String body) {
        return Unirest
                .post(uri)
                .header("Accept", "application/n-triples")
                .header("Content-Type", "application/n-triples")
                .body(body);
    }

    private static RequestBodyEntity buildCreateRequest(String uri, String body) {
        return Unirest
                .post(uri)
                .header("Accept", "application/ld+json")
                .header("Content-Type", "application/ld+json")
                .body(body);
    }

    private void doSearchForWorkWithFormat(String name, String format) throws UnirestException, InterruptedException {
        boolean foundWorkInIndex;
        boolean foundFormatInIndex;
        int attempts = FIFTY_TIMES;
        do {
            HttpRequest request = Unirest
                    .get(baseUri + "search/work/_search").queryString("q", "work.mainTitle=" + name);
            HttpResponse<?> response = request.asJson();
            assertResponse(Status.OK, response);
            String responseBody = response.getBody().toString();
            foundWorkInIndex = responseBody.contains(name);
            foundFormatInIndex = responseBody.contains(format);
            if (!foundWorkInIndex || !foundFormatInIndex) {
                LOG.info("Work with given format not found in index yet, waiting one second.");
                Thread.sleep(ONE_SECOND);
            }
        } while ((!foundWorkInIndex || !foundFormatInIndex) && attempts-- > 0);
        if (foundWorkInIndex && foundFormatInIndex) {
            assertTrue("Work with given format found in index", foundWorkInIndex);
        } else if (foundWorkInIndex) {
            fail("Work found in index, but not with the correct format.");
        } else {
            fail("Work not found in index.");
        }
    }

    @Test
    public void test_update_work_index_when_publication_is_updated() throws Exception {
        kohaSvcMock.addLoginExpectation();
        kohaSvcMock.addPostNewBiblioExpectation(FIRST_BIBLIO_ID);

        final HttpResponse<JsonNode> createWorkResponse = buildEmptyCreateRequest(baseUri + "work").asJson();
        assertResponse(Status.CREATED, createWorkResponse);
        final String workUri = getLocation(createWorkResponse);
        final JsonArray addNameToWorkPatch = buildLDPatch(buildPatchStatement("add", workUri, baseUri + "ontology#mainTitle", "Paris"));
        final HttpResponse<String> patchAddNameToWorkPatchResponse = buildPatchRequest(workUri, addNameToWorkPatch).asString();
        assertResponse(Status.OK, patchAddNameToWorkPatchResponse);

        final HttpResponse<JsonNode> createPublicationResponse = buildEmptyCreateRequest(baseUri + "publication").asJson();

        assertResponse(Status.CREATED, createPublicationResponse);
        final String publicationUri = getLocation(createPublicationResponse);
        assertIsUri(publicationUri);
        assertThat(publicationUri, startsWith(baseUri));

        kohaSvcMock.addLenientUpdateExpectation(FIRST_BIBLIO_ID);
        final JsonArray addPublicationOfToPublicationPatch = buildLDPatch(buildPatchStatement("add", publicationUri, baseUri + "ontology#publicationOf", workUri, ANY_URI));
        final HttpResponse<String> patchAddPublicationOfToPublicationPatchResponse = buildPatchRequest(publicationUri, addPublicationOfToPublicationPatch).asString();
        assertResponse(Status.OK, patchAddPublicationOfToPublicationPatchResponse);

        kohaSvcMock.addLenientUpdateExpectation(FIRST_BIBLIO_ID);
        final JsonArray addFormatToPublicationPatch = buildLDPatch(buildPatchStatement("add", publicationUri, baseUri + "ontology#format", "http://data.deichman.no/format#Atlas", ANY_URI));
        final HttpResponse<String> patchAddFormatToPublicationPatchResponse = buildPatchRequest(publicationUri, addFormatToPublicationPatch).asString();
        assertResponse(Status.OK, patchAddFormatToPublicationPatchResponse);

        final JsonArray addNameToWorkPatch1 = buildLDPatch(buildPatchStatement("add", workUri, baseUri + "ontology#partTitle", "Paris"));
        final HttpResponse<String> patchAddNameToWorkPatchResponse1 = buildPatchRequest(workUri, addNameToWorkPatch1).asString();
        assertResponse(Status.OK, patchAddNameToWorkPatchResponse1);


        doSearchForWorkWithFormat("Paris", "Atlas");
    }

    @Test
    public void happy_day_scenario() throws Exception {

        kohaSvcMock.addLoginExpectation();
        kohaSvcMock.addPostNewBiblioExpectation(FIRST_BIBLIO_ID);

        final HttpResponse<JsonNode> createPublicationResponse = buildEmptyCreateRequest(baseUri + "publication").asJson();

        assertResponse(Status.CREATED, createPublicationResponse);
        final String publicationUri = getLocation(createPublicationResponse);
        assertIsUri(publicationUri);
        assertThat(publicationUri, startsWith(baseUri));

        final HttpResponse<JsonNode> createWorkResponse = buildEmptyCreateRequest(baseUri + "work").asJson();

        assertResponse(Status.CREATED, createWorkResponse);
        final String workUri = getLocation(createWorkResponse);
        assertIsUri(workUri);
        assertThat(workUri, startsWith(baseUri));

        final JsonArray addNameToWorkPatch = buildLDPatch(buildPatchStatement("add", workUri, baseUri + "ontology#mainTitle", "Sult"));
        final HttpResponse<String> patchAddNameToWorkPatchResponse = buildPatchRequest(workUri, addNameToWorkPatch).asString();
        assertResponse(Status.OK, patchAddNameToWorkPatchResponse);

        final JsonArray addYearToWorkPatch = buildLDPatch(buildPatchStatement("add", workUri, baseUri + "ontology#publicationYear", "2015", "http://www.w3.org/2001/XMLSchema#gYear"));
        final HttpResponse<String> patchAddYearToWorkPatchResponse = buildPatchRequest(workUri, addYearToWorkPatch).asString();
        assertResponse(Status.OK, patchAddYearToWorkPatchResponse);

        final HttpResponse<JsonNode> createPersonResponse = buildEmptyCreateRequest(baseUri + "person").asJson();
        assertResponse(Status.CREATED, createPersonResponse);
        final String personUri = getLocation(createPersonResponse);
        assertIsUri(personUri);
        assertThat(personUri, startsWith(baseUri));

        final JsonArray addCreatorNameToPersonPatch = buildLDPatch(buildPatchStatement("add", personUri, baseUri + "ontology#name", "Knut Hamsun"));
        final HttpResponse<String> patchAddCreatornameToPersonPatchResponse = buildPatchRequest(personUri, addCreatorNameToPersonPatch).asString();
        assertResponse(Status.OK, patchAddCreatornameToPersonPatchResponse);

        final JsonArray addBirthToPersonPatch = buildLDPatch(buildPatchStatement("add", personUri, baseUri + "ontology#birthYear", "1923", "http://www.w3.org/2001/XMLSchema#gYear"));
        final HttpResponse<String> patchAddBirthToPersonPatchResponse = buildPatchRequest(personUri, addBirthToPersonPatch).asString();
        assertResponse(Status.OK, patchAddBirthToPersonPatchResponse);

        final JsonArray addDeathToPersonPatch = buildLDPatch(buildPatchStatement("add", personUri, baseUri + "ontology#deathYear", "2015", "http://www.w3.org/2001/XMLSchema#gYear"));
        final HttpResponse<String> patchAddDeathToPersonPatchResponse = buildPatchRequest(personUri, addDeathToPersonPatch).asString();
        assertResponse(Status.OK, patchAddDeathToPersonPatchResponse);

        final JsonArray addCreatorToWorkPatch = buildLDPatch(buildPatchStatement("add", workUri, baseUri + "ontology#creator", personUri, ANY_URI));
        final HttpResponse<String> patchAddCreatorToWorkPatchResponse = buildPatchRequest(workUri, addCreatorToWorkPatch).asString();
        assertResponse(Status.OK, patchAddCreatorToWorkPatchResponse);


        HttpResponse<JsonNode> jsonNodeHttpResponse = Unirest.get(workUri).asJson();

        final JsonArray workIntoPublicationPatch = buildLDPatch(buildPatchStatement("add", publicationUri, baseUri + "ontology#publicationOf", workUri, ANY_URI));

        final HttpResponse<String> patchWorkIntoPublicationResponse = buildPatchRequest(publicationUri, workIntoPublicationPatch).asString();
        assertResponse(Status.OK, patchWorkIntoPublicationResponse);

        kohaSvcMock.addPostNewBiblioExpectation(SECOND_BIBLIO_ID);

        final HttpResponse<JsonNode> createSecondPublicationResponse = buildEmptyCreateRequest(baseUri + "publication").asJson();
        assertResponse(Status.CREATED, createSecondPublicationResponse);
        final String secondPublicationUri = getLocation(createSecondPublicationResponse);

        final JsonArray workIntoSecondPublicationPatch = buildLDPatch(buildPatchStatement("add", secondPublicationUri, baseUri + "ontology#publicationOf", workUri, ANY_URI));
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
                                + "?publication deichman:publicationOf <" + workUri + "> ."
                                + "}"), workWith2PublicationsModel);
        assertThat("model does not have a work with two publications",
                workWith2PublicationsCount.execSelect().next().getLiteral("noOfPublications").getInt(),
                equalTo(2));

        // Two publications with a total of three items
        kohaSvcMock.addGetBiblioExpectation(FIRST_BIBLIO_ID, 2);
        kohaSvcMock.addGetBiblioExpectation(SECOND_BIBLIO_ID, 1);

        final HttpResponse<JsonNode> getWorkWith2Plus1ItemsResponse = buildGetItemsRequest(workUri).asJson();
        final JsonNode work1Plus2Items = getWorkWith2Plus1ItemsResponse.getBody();
        final Model work1Plus2ItemsModel = RDFModelUtil.modelFrom(work1Plus2Items.toString(), Lang.JSONLD);

        final QueryExecution workWith1Plus2ItemsCount = QueryExecutionFactory.create(
                QueryFactory.create(
                        "PREFIX deichman: <" + baseUri + "ontology#>"
                                + "SELECT (COUNT (?item) AS ?noOfItems) { "
                                + "?item a deichman:Item ."
                                + "}"), work1Plus2ItemsModel);
        assertThat("model does not have 2 + 1 = 3 items",
                workWith1Plus2ItemsCount.execSelect().next().getLiteral("noOfItems").getInt(),
                equalTo(2 + 1));
        assertThat("model does not contain shelfmarks",
                work1Plus2ItemsModel.listSubjectsWithProperty(createProperty("http://data.deichman.no/utility#shelfmark")).toList().size(),
                equalTo(2 + 1));
        assertThat("model does not contain onloan booleans",
                work1Plus2ItemsModel.listSubjectsWithProperty(createProperty("http://data.deichman.no/utility#onloan")).toList().size(),
                equalTo(2 + 1));
        Unirest.get(workUri).asJson();
        HttpResponse<String> stringHttpResponse = Unirest.put(workUri + "/index").asString();
        assertNotNull(stringHttpResponse);
        doSearchForWorks("Sult");
        doSearchForPersons("Hamsun");

        //Change the work title and search for it again.
        final JsonArray delTitleToWorkPatch = buildLDPatch(buildPatchStatement("del", workUri, baseUri + "ontology#mainTitle", "Sult"));
        final HttpResponse<String> patchDelTitleToWorkPatchResponse = buildPatchRequest(workUri, delTitleToWorkPatch).asString();
        assertResponse(Status.OK, patchDelTitleToWorkPatchResponse);
        final JsonArray addNewTitleToWorkPatch = buildLDPatch(buildPatchStatement("add", workUri, baseUri + "ontology#mainTitle", "Metthet"));
        final HttpResponse<String> patchAddNewTitleToWorkPatchResponse = buildPatchRequest(workUri, addNewTitleToWorkPatch).asString();
        assertResponse(Status.OK, patchAddNewTitleToWorkPatchResponse);
        doSearchForWorks("Metthet");

        //Change the person name and search for it again.
        final JsonArray delCreatorNameToPersonPatch = buildLDPatch(buildPatchStatement("del", personUri, baseUri + "ontology#name", "Knut Hamsun"));
        final HttpResponse<String> patchDelCreatorNameToPersonPatchResponse = buildPatchRequest(personUri, delCreatorNameToPersonPatch).asString();
        assertResponse(Status.OK, patchDelCreatorNameToPersonPatchResponse);
        final JsonArray addNewCreatorNameToPersonPatch = buildLDPatch(buildPatchStatement("add", personUri, baseUri + "ontology#name", "George Orwell"));
        final HttpResponse<String> patchAddNewCreatorNameToPersonPatchResponse = buildPatchRequest(personUri, addNewCreatorNameToPersonPatch).asString();
        assertResponse(Status.OK, patchAddNewCreatorNameToPersonPatchResponse);
        doSearchForPersons("Orwell");
    }

    @Test
    public void person_resource_can_be_created_if_not_a_duplicate() throws UnirestException {
        String input = "<__BASEURI__externalPerson/p1234> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <__BASEURI__ontology#Person> .\n"
                + "<__BASEURI__externalPerson/p1234> <__BASEURI__ontology#name> \"Kim Kimsen\"^^<http://www.w3.org/1999/02/22-rdf-syntax-ns#plainLiteral> .\n"
                + "<__BASEURI__externalPerson/p1234> <http://data.deichman.no/duo#bibliofilPersonId> \"1234\" .\n"
                + "<__BASEURI__externalPerson/p1234> <__BASEURI__ontology#birthYear> \"1988\"^^<http://www.w3.org/2001/XMLSchema#gYear> .\n";

        input = input.replace("__BASEURI__", baseUri);

        String duplicateInput = "<__BASEURI__externalPerson/p1234> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <__BASEURI__ontology#Person> .\n"
                + "<__BASEURI__externalPerson/p1234> <__BASEURI__ontology#name> \"Kim Kimsen\"^^<http://www.w3.org/1999/02/22-rdf-syntax-ns#plainLiteral> .\n"
                + "<__BASEURI__externalPerson/p1234> <http://data.deichman.no/duo#bibliofilPersonId> \"1234\" .\n"
                + "<__BASEURI__externalPerson/p1234> <__BASEURI__ontology#birthYear> \"1988\"^^<http://www.w3.org/2001/XMLSchema#gYear> .\n";
        duplicateInput = duplicateInput.replace("__BASEURI__", baseUri);

        Model testModel = RDFModelUtil.modelFrom(input, Lang.NTRIPLES);
        String body = RDFModelUtil.stringFrom(testModel, Lang.JSONLD);

        Model testModel2 = RDFModelUtil.modelFrom(duplicateInput, Lang.NTRIPLES);
        String body2 = RDFModelUtil.stringFrom(testModel2, Lang.JSONLD);

        HttpResponse<String> result1 = buildCreateRequest(baseUri + "person", body).asString();
        HttpResponse<String> result2 = buildCreateRequest(baseUri + "person", body2).asString();

        assertResponse(Status.CONFLICT, result2);
        String location1 = getLocation(result1);
        String location2 = getLocation(result2);
        assertTrue(location1.equals(location2));
    }

    @Test
    public void place_of_publication_resource_can_be_created_if_not_a_duplicate() throws UnirestException {
        String input = "<__BASEURI__externalPlaceOfPublication/g1234> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <__BASEURI__ontology#PlaceOfPublication> .\n"
                + "<__BASEURI__externalPlaceOfPublication/g1234> <__BASEURI__ontology#place> \"Oslo\"^^<http://www.w3.org/1999/02/22-rdf-syntax-ns#plainLiteral> .\n"
                + "<__BASEURI__externalPlaceOfPublication/g1234> <http://data.deichman.no/duo#bibliofilPlaceOfPublicationId> \"1234\" .\n"
                + "<__BASEURI__externalPlaceOfPublication/g1234> <__BASEURI__ontology#country> \"Norge\"^^<http://www.w3.org/1999/02/22-rdf-syntax-ns#plainLiteral> .\n";

        input = input.replace("__BASEURI__", baseUri);

        String duplicateInput = "<__BASEURI__externalPlaceOfPublication/g1234> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <__BASEURI__ontology#PlaceOfPublication> .\n"
                + "<__BASEURI__externalPlaceOfPublication/g1234> <__BASEURI__ontology#place> \"Oslo\"^^<http://www.w3.org/1999/02/22-rdf-syntax-ns#plainLiteral> .\n"
                + "<__BASEURI__externalPlaceOfPublication/g1234> <http://data.deichman.no/duo#bibliofilPlaceOfPublicationId> \"1234\" .\n"
                + "<__BASEURI__externalPlaceOfPublication/g1234> <__BASEURI__ontology#country> \"Norge\"^^<http://www.w3.org/1999/02/22-rdf-syntax-ns#plainLiteral> .\n";
        duplicateInput = duplicateInput.replace("__BASEURI__", baseUri);

        Model testModel = RDFModelUtil.modelFrom(input, Lang.NTRIPLES);
        String body = RDFModelUtil.stringFrom(testModel, Lang.JSONLD);

        Model testModel2 = RDFModelUtil.modelFrom(duplicateInput, Lang.NTRIPLES);
        String body2 = RDFModelUtil.stringFrom(testModel2, Lang.JSONLD);

        HttpResponse<String> result1 = buildCreateRequest(baseUri + "placeOfPublication", body).asString();
        HttpResponse<String> result2 = buildCreateRequest(baseUri + "placeOfPublication", body2).asString();

        assertResponse(Status.CONFLICT, result2);
        String location1 = getLocation(result1);
        String location2 = getLocation(result2);
        assertTrue(location1.equals(location2));
    }

    @Test
    public void place_of_publication_is_patched() throws UnirestException {
        HttpResponse<String> result1 = buildCreateRequest(baseUri + "placeOfPublication", "{}").asString();
        String op = "ADD";
        String s = getLocation(result1);
        String p = baseUri + "ontology#place";
        String o = "Oslo";
        String type = "http://www.w3.org/2001/XMLSchema#string";
        JsonArray body = buildLDPatch(buildPatchStatement(op, s, p, o, type));
        HttpResponse<String> result2 = buildPatchRequest(s, body).asString();
        assertEquals(Status.OK.getStatusCode(), result2.getStatus());
    }


    @Test
    public void place_of_publication_is_deleted() throws UnirestException {
        HttpResponse<String> result1 = buildCreateRequest(baseUri + "placeOfPublication", "{}").asString();
        HttpResponse<String> result2 = buildDeleteRequest(getLocation(result1));
        assertEquals(Status.NO_CONTENT.getStatusCode(), result2.getStatus());
    }

    @Test
    public void place_of_publication_is_searchable() throws UnirestException, InterruptedException {
        HttpResponse<String> result1 = buildCreateRequest(baseUri + "placeOfPublication", "{}").asString();

        String op = "ADD";
        String s = getLocation(result1);
        String p1 = baseUri + "ontology#place";
        String o1 = "Oslo";
        String type = "http://www.w3.org/2001/XMLSchema#string";
        String p2 = baseUri + "ontology#country";
        String o2 = "Norway";

        JsonArray body = Json.createArrayBuilder()
                .add(buildLDPatch(buildPatchStatement(op, s, p1, o1, type)).get(0))
                .add(buildLDPatch(buildPatchStatement(op, s, p2, o2, type)).get(0))
                .build();

        HttpResponse<String> result2 = buildPatchRequest(s, body).asString();
        assertEquals(Status.OK.getStatusCode(), result2.getStatus());
        doSearchForPlaceOfPublication("Oslo");
    }

    private HttpResponse<String> buildDeleteRequest(String location) throws UnirestException {
        return Unirest
                .delete(location).asString();
    }

    @Test
    public void publisher_resource_can_be_created_if_not_a_duplicate() throws UnirestException {
        String input = "<__BASEURI__externalPublisher/i1234> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <__BASEURI__ontology#Publisher> .\n"
                + "<__BASEURI__externalPublisher/i1234> <__BASEURI__ontology#name> \"Publisher name\"^^<http://www.w3.org/1999/02/22-rdf-syntax-ns#plainLiteral> .\n"
                + "<__BASEURI__externalPublisher/i1234> <http://data.deichman.no/duo#bibliofilPublisherId> \"1234\" .\n";
        input = input.replace("__BASEURI__", baseUri);

        String duplicateInput = "<__BASEURI__externalPublisher/i1234> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <__BASEURI__ontology#Publisher> .\n"
                + "<__BASEURI__externalPublisher/i1234> <__BASEURI__ontology#name> \"Publisher name\"^^<http://www.w3.org/1999/02/22-rdf-syntax-ns#plainLiteral> .\n"
                + "<__BASEURI__externalPublisher/i1234> <http://data.deichman.no/duo#bibliofilPublisherId> \"1234\" .\n";
        duplicateInput = duplicateInput.replace("__BASEURI__", baseUri);

        Model testModel = RDFModelUtil.modelFrom(input, Lang.NTRIPLES);
        String body = RDFModelUtil.stringFrom(testModel, Lang.JSONLD);

        Model testModel2 = RDFModelUtil.modelFrom(duplicateInput, Lang.NTRIPLES);
        String body2 = RDFModelUtil.stringFrom(testModel2, Lang.JSONLD);

        HttpResponse<String> result1 = buildCreateRequest(baseUri + "publisher", body).asString();
        HttpResponse<String> result2 = buildCreateRequest(baseUri + "publisher", body).asString();

        assertResponse(Status.CONFLICT, result2);
        String location1 = getLocation(result1);
        String location2 = getLocation(result2);
        assertTrue(location1.equals(location2));
    }

    @Test
    public void publisher_is_patched() throws UnirestException {
        HttpResponse<String> result1 = buildCreateRequest(baseUri + "publisher", "{}").asString();
        String op = "ADD";
        String s = getLocation(result1);
        String p = baseUri + "ontology#name";
        String o = "Acme Publishing Norway";
        String type = "http://www.w3.org/2001/XMLSchema#string";
        JsonArray body = buildLDPatch(buildPatchStatement(op, s, p, o, type));
        HttpResponse<String> result2 = buildPatchRequest(s, body).asString();
        assertEquals(Status.OK.getStatusCode(), result2.getStatus());
    }

    @Test
    public void place_of_publisher_is_deleted() throws UnirestException {
        HttpResponse<String> result1 = buildCreateRequest(baseUri + "publisher", "{}").asString();
        HttpResponse<String> result2 = buildDeleteRequest(getLocation(result1));
        assertEquals(Status.NO_CONTENT.getStatusCode(), result2.getStatus());
    }

    @Test
    public void publication_with_data_and_items_should_post_items_to_koha() throws Exception {
        kohaSvcMock.addLoginExpectation();
        kohaSvcMock.newBiblioWithItemsExpectation(ANOTHER_BIBLIO_ID, "03011527411001");

        String input = "<__BASEURI__bibliofilResource/1527411> <__BASEURI__ontology#bibliofilID> \"1527411\" .\n"
                + "<__BASEURI__bibliofilResource/1527411> <__BASEURI__ontology#language> <http://lexvo.org/id/iso639-3/eng> .\n"
                + "<__BASEURI__bibliofilResource/1527411> <__BASEURI__ontology#format> <__BASEURI__format#Book> .\n"
                + "<__BASEURI__bibliofilResource/1527411> <__BASEURI__ontology#mainTitle> \"Critical issues in contemporary Japan\" ."
                + itemNTriples("03011527411001");
        input = input.replace("__BASEURI__", baseUri);
        Model testModel = RDFModelUtil.modelFrom(input, Lang.NTRIPLES);
        String body = RDFModelUtil.stringFrom(testModel, Lang.JSONLD);

        HttpResponse<JsonNode> createPublicationResponse = buildCreateRequest(baseUri + "publication", body).asJson();
        String publicationUri = getLocation(createPublicationResponse);
        assertIsUri(publicationUri);
        assertThat(publicationUri, startsWith(baseUri));
    }

    private String itemNTriples(final String barcode) {
        return "<__BASEURI__bibliofilResource/1527411> <__BASEURI__ontology#hasItem> <__BASEURI__bibliofilItem/x" + barcode + "> .\n"
                + "<__BASEURI__bibliofilItem/x" + barcode + "> <__BASEURI__itemSubfieldCode/a> \"hutl\" .\n"
                + "<__BASEURI__bibliofilItem/x" + barcode + "> <__BASEURI__itemSubfieldCode/b> \"hutl\" .\n"
                + "<__BASEURI__bibliofilItem/x" + barcode + "> <__BASEURI__itemSubfieldCode/c> \"m\" .\n"
                + "<__BASEURI__bibliofilItem/x" + barcode + "> <__BASEURI__itemSubfieldCode/l> \"3\" .\n"
                + "<__BASEURI__bibliofilItem/x" + barcode + "> <__BASEURI__itemSubfieldCode/m> \"1\" .\n"
                + "<__BASEURI__bibliofilItem/x" + barcode + "> <__BASEURI__itemSubfieldCode/o> \"952 Cri\" .\n"
                + "<__BASEURI__bibliofilItem/x" + barcode + "> <__BASEURI__itemSubfieldCode/p> \"" + barcode + "\" .\n"
                + "<__BASEURI__bibliofilItem/x" + barcode + "> <__BASEURI__itemSubfieldCode/q> \"2014-11-05\" .\n"
                + "<__BASEURI__bibliofilItem/x" + barcode + "> <__BASEURI__itemSubfieldCode/t> \"1\" .\n"
                + "<__BASEURI__bibliofilItem/x" + barcode + "> <__BASEURI__itemSubfieldCode/y> \"L\" .";
    }

    @Test
    public void get_authorized_values_for_language() throws Exception {
        HttpRequest languageRequest = Unirest
                .get(baseUri + "authorized_values/language")
                .header("Accept", "application/ld+json");
        HttpResponse<?> languageResponse = languageRequest.asString();
        assertResponse(Status.OK, languageResponse);

        Model model = RDFModelUtil.modelFrom(languageResponse.getBody().toString(), Lang.JSONLD);
        boolean hasEnglish = model.contains(createStatement(
                createResource("http://lexvo.org/id/iso639-3/eng"),
                RDFS.label,
                createLangLiteral("Engelsk", "no")
        ));
        assertTrue("model doesn't have English", hasEnglish);
    }

    @Test
    public void get_authorized_values_for_format() throws Exception {
        HttpRequest formatRequest = Unirest
                .get(baseUri + "authorized_values/format")
                .header("Accept", "application/ld+json");
        HttpResponse<?> formatResponse = formatRequest.asString();
        assertResponse(Status.OK, formatResponse);

        Model model = RDFModelUtil.modelFrom(formatResponse.getBody().toString(), Lang.JSONLD);
        boolean hasBook = model.contains(createStatement(
                createResource("http://data.deichman.no/format#Book"),
                RDFS.label,
                createLangLiteral("Bok", "no")
        ));
        assertTrue("model doesn't have Book", hasBook);
    }

    @Test
    public void get_authorized_values_for_nationality() throws Exception {
        HttpRequest nationalityRequest = Unirest
                .get(baseUri + "authorized_values/nationality")
                .header("Accept", "application/ld+json");
        HttpResponse<?> nationalityResponse = nationalityRequest.asString();
        assertResponse(Status.OK, nationalityResponse);

        Model model = RDFModelUtil.modelFrom(nationalityResponse.getBody().toString(), Lang.JSONLD);
        boolean hasNationality = model.contains(createStatement(
                createResource("http://data.deichman.no/nationality#eng"),
                RDFS.label,
                createLangLiteral("Engelsk", "no")
        ));
        assertTrue("model doesn't have English nationality", hasNationality);
    }

    @Test
    public void get_ontology() throws Exception {
        HttpRequest request = Unirest
                .get(baseUri + "ontology")
                .header("Accept", MimeType.LD_JSON);
        HttpResponse<?> response = request.asString();
        assertResponse(Status.OK, response);

        Model ontology = RDFModelUtil.modelFrom(response.getBody().toString(), Lang.JSONLD);
        Statement workStatement = createStatement(
                createResource(baseUri + "ontology#Work"),
                RDFS.label,
                createLangLiteral("Verk", "no")
        );
        assertTrue("ontology doesn't have Work", ontology.contains(workStatement));
    }

    @Test
    @Ignore
    public void when_get_elasticsearch_work_should_return_something() throws Exception {
        indexWork("1", "Sult");
        doSearchForWorks("Sult");
    }

    private void doSearchForWorks(String name, boolean... invert) throws UnirestException, InterruptedException {
        boolean foundWorkInIndex;
        boolean doInvert = invert != null && invert.length > 0 && invert[0];
        int attempts = FIFTY_TIMES;
        do {
            HttpRequest request = Unirest
                    .get(baseUri + "search/work/_search").queryString("q", "work.mainTitle=" + name);
            HttpResponse<?> response = request.asJson();
            assertResponse(Status.OK, response);
            String responseBody = response.getBody().toString();
            foundWorkInIndex = responseBody.contains(name)
                    && responseBody.contains("person/h");
            if (foundWorkInIndex == doInvert) {
                LOG.info("Work not found in index yet, waiting one second");
                Thread.sleep(ONE_SECOND);
            }
        } while (foundWorkInIndex == doInvert && attempts-- > 0);
        if (!doInvert) {
            assertTrue("Should have found work in index by now", foundWorkInIndex);
        } else {
            assertFalse("Should not have found work in index", foundWorkInIndex);
        }
    }

    private void doSearchForPersons(String name) throws UnirestException, InterruptedException {
        boolean foundPersonInIndex;
        int attempts = TEN_TIMES;
        do {
            HttpRequest request = Unirest
                    .get(baseUri + "search/person/_search").queryString("q", "person.name=" + name);
            HttpResponse<?> response = request.asJson();
            assertResponse(Status.OK, response);
            String responseBody = response.getBody().toString();
            foundPersonInIndex = responseBody.contains(name);
            if (!foundPersonInIndex) {
                LOG.info("Person not found in index yet, waiting one second");
                Thread.sleep(ONE_SECOND);
            }
        } while (!foundPersonInIndex && attempts-- > 0);
        assertTrue("Should have found person in index by now", foundPersonInIndex);
    }

    private void doSearchForPlaceOfPublication(String place) throws UnirestException, InterruptedException {
        boolean foundPlaceOfPublicationInIndex;
        int attempts = TEN_TIMES;
        do {
            HttpRequest request = Unirest.get(baseUri + "search/placeOfPublication/_search").queryString("q", "placeOfPublication.place:" + place);
            HttpResponse<?> response = request.asJson();
            String responseBody = response.getBody().toString();
            foundPlaceOfPublicationInIndex = responseBody.contains(place);
            if (!foundPlaceOfPublicationInIndex) {
                LOG.info("Place of publication not found in index yet, waiting one second");
                Thread.sleep(ONE_SECOND);
            }
        } while (!foundPlaceOfPublicationInIndex && attempts-- > 0);

        assertTrue("Should have found place of publication in index by now", foundPlaceOfPublicationInIndex);
    }

    private void indexWork(String workId, String title) {
        getClient().prepareIndex("search", "work", workId)
                .setSource(""
                        + "{ \"work\": {"
                        + "    \"mainTitle\": \"" + title + "\","
                        + "    \"publicationYear\": \"1890\","
                        + "    \"uri\": \"http://deichman.no/work/w12344553\","
                        + "    \"creator\": {"
                        + "       \"name\": \"Knut Hamsun\","
                        + "       \"birthYear\": \"1859\","
                        + "       \"deathYear\": \"1952\","
                        + "       \"uri\": \"http://deichman.no/person/h12345\""
                        + "    }"
                        + "}"
                        + "}")
                .execute()
                .actionGet();
    }

    @Test
    public void when_get_elasticsearch_work_without_query_parameter_should_get_bad_request_response() throws Exception {
        HttpRequest request = Unirest
                .get(baseUri + "search/work/_search");
        HttpResponse<?> response = request.asString();
        assertResponse(Status.BAD_REQUEST, response);
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

    protected Client getClient() {
        return embeddedElasticsearchServer.getClient();
    }

    @Test
    public void correct_marc_xml_gets_sent_to_koha_on_post_publication() throws UnirestException {
        String creator = "Knut Hamsun";
        String workTitle = "Hunger";
        String publicationTitle = "Sult";
        String partTitle = "Svolten";
        String partNumber = "Part 1";
        String isbn = "978-3-16-148410-0";
        String publicationYear = "2016";
        String ontologyURI = baseUri + "ontology#";

        setupExpectationForMarcXmlSentToKoha(creator, publicationTitle, partTitle, partNumber, isbn, publicationYear);
        kohaSvcMock.addLoginExpectation();

        String personUri = createPersonInRdfStore(creator, ontologyURI);
        String workUri = createWorkInRdfStore(workTitle, ontologyURI, personUri);

        String publicationTriples = ""
                + "<publication> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <" + ontologyURI + "Publication> .\n"
                + "<publication> <" + ontologyURI + "mainTitle> \"" + publicationTitle + "\" .\n"
                + "<publication> <" + ontologyURI + "partTitle> \"" + partTitle + "\" .\n"
                + "<publication> <" + ontologyURI + "publicationOf> <__WORKURI__> .\n"
                + "<publication> <" + ontologyURI + "partNumber> \"" + partNumber + "\" .\n"
                + "<publication> <" + ontologyURI + "isbn> \"" + isbn + "\" .\n"
                + "<publication> <" + ontologyURI + "publicationYear> \"" + publicationYear + "\" .\n";

        HttpResponse<JsonNode> createpublicationResponse = buildCreateRequestNtriples(baseUri + "publication", publicationTriples.replace("__WORKURI__", workUri)).asJson();
        assertNotNull(getLocation(createpublicationResponse));
    }

    private String createWorkInRdfStore(String workTitle, String ontologyURI, String personUri) throws UnirestException {
        String workTriples = ""
                + "<work> <" + ontologyURI + "mainTitle> \"" + workTitle + "\" .\n"
                + "<work> <" + ontologyURI + "publicationYear> \"2011\"^^<http://www.w3.org/2001/XMLSchema#gYear> ."
                + "<work> <" + ontologyURI + "creator> <__CREATORURI__> .\n";
        HttpResponse<JsonNode> createworkResponse = buildCreateRequestNtriples(baseUri + "work", workTriples.replace("__CREATORURI__", personUri)).asJson();
        return getLocation(createworkResponse);
    }

    private String createPersonInRdfStore(String creator, String ontologyURI) throws UnirestException {
        String personTriples = ""
                + "<person> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <" + ontologyURI + "Person> .\n"
                + "<person> <" + ontologyURI + "name> \"" + creator + "\" .";
        HttpResponse<JsonNode> createPersonResponse = buildCreateRequestNtriples(baseUri + "person", personTriples).asJson();
        return getLocation(createPersonResponse);
    }

    private void setupExpectationForMarcXmlSentToKoha(String creator, String publicationTitle, String partTitle, String partNumber, String isbn, String publicationYear) {
        // TODO MARC XML can end up in any order, need a better comparison method for expected MARC XML
        String expectedPayload = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
                + "<marcxml:collection xmlns:marcxml=\"http://www.loc.gov/MARC21/slim\">"
                + "<marcxml:record><marcxml:leader>00000    a2200000       </marcxml:leader>"
                + "<marcxml:datafield tag=\"100\" ind1=\" \" ind2=\" \">"
                + "<marcxml:subfield code=\"a\">" + creator + "</marcxml:subfield></marcxml:datafield>"
                + "<marcxml:datafield tag=\"245\" ind1=\" \" ind2=\" \">"
                + "<marcxml:subfield code=\"a\">" + publicationTitle + "</marcxml:subfield></marcxml:datafield>"
                + "<marcxml:datafield tag=\"245\" ind1=\" \" ind2=\" \">"
                + "<marcxml:subfield code=\"p\">" + partTitle + "</marcxml:subfield></marcxml:datafield>"
                + "<marcxml:datafield tag=\"245\" ind1=\" \" ind2=\" \">"
                + "<marcxml:subfield code=\"n\">" + partNumber + "</marcxml:subfield></marcxml:datafield>"
                + "<marcxml:datafield tag=\"020\" ind1=\" \" ind2=\" \">"
                + "<marcxml:subfield code=\"a\">" + isbn + "</marcxml:subfield></marcxml:datafield>"
                + "<marcxml:datafield tag=\"260\" ind1=\" \" ind2=\" \">"
                + "<marcxml:subfield code=\"c\">" + publicationYear + "</marcxml:subfield></marcxml:datafield>"
                + "</marcxml:record></marcxml:collection>\n";
        kohaSvcMock.newBiblioFromMarcXmlExpectation(FIRST_BIBLIO_ID, expectedPayload);
    }

    @Test
    public void should_return_marc_xml_for_existing_biblio_id() throws UnirestException, IOException {
        kohaSvcMock.addLoginExpectation();
        kohaSvcMock.addPostNewBiblioExpectation(FIRST_BIBLIO_ID);

        String expected = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
                + "<record\n"
                + "    xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"\n"
                + "    xsi:schemaLocation=\"http://www.loc.gov/MARC21/slim http://www.loc.gov/standards/marcxml/schema/MARC21slim.xsd\"\n"
                + "    xmlns=\"http://www.loc.gov/MARC21/slim\">\n"
                + "\n"
                + "  <leader>00080    a2200049   4500</leader>\n"
                + "  <datafield tag=\"245\" ind1=\" \" ind2=\" \">\n"
                + "    <subfield code=\"a\">Test test test</subfield>\n"
                + "  </datafield>\n"
                + "  <datafield tag=\"999\" ind1=\" \" ind2=\" \">\n"
                + "    <subfield code=\"c\">27</subfield>\n"
                + "    <subfield code=\"d\">27</subfield>\n"
                + "  </datafield>\n"
                + "</record>\n";

        HttpResponse<String> response = buildEmptyCreateRequest(baseUri + "publication").asString();
        String location = getLocation(response);

        final HttpResponse<JsonNode> getPublication = buildGetRequest(location).asJson();

        Model model = RDFModelUtil.modelFrom(getPublication.getBody().toString(), Lang.JSONLD);
        final String[] recordId = new String[1];
        model.listObjectsOfProperty(createProperty(baseUri + "ontology#recordID")).forEachRemaining(s -> recordId[0] = s.asLiteral().toString());

        kohaSvcMock.addGetBiblioExpectation(recordId[0], expected);
        HttpResponse<String> result = Unirest.get(baseUri + "marc/" + recordId[0]).asString();
        assertEquals(expected, result.getBody());
    }

    @Test
    public void when_index_is_cleared_search_returns_nothing() throws Exception {
        indexWork("101", "Lord of the rings");
        doSearchForWorks("Lord");
        HttpResponse<String> response = Unirest.post(baseUri + "search/clear_index").asString();
        assertEquals(HTTP_OK, response.getStatus());
        doSearchForWorks("Lord", SHOULD_NOT_FIND);
        indexWork("102", "Lucky Luke");
        doSearchForWorks("Lucky");
    }

    @Test
    public void when_index_is_cleared_and_reindexed_works_are_found() throws Exception {
        indexWork("101", "Lord of the rings");
        doSearchForWorks("Lord");
        HttpResponse<String> response = Unirest.post(baseUri + "search/clear_index").asString();
        assertEquals(HTTP_OK, response.getStatus());
        doSearchForWorks("Lord", SHOULD_NOT_FIND);
        String ontologyURI = baseUri + "ontology#";

        String personUri = createPersonInRdfStore("Morris", ontologyURI);
        createWorkInRdfStore("Lucky Luke", ontologyURI, personUri);
        Unirest.post(baseUri + "search/work/reindex_all").asString();
        doSearchForWorks("Lucky");
    }
}
