package no.deichman.services.services;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonParser;
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.JsonNode;
import com.mashape.unirest.http.Unirest;
import com.mashape.unirest.http.exceptions.UnirestException;
import com.mashape.unirest.request.GetRequest;
import com.mashape.unirest.request.HttpRequest;
import com.mashape.unirest.request.body.RequestBodyEntity;
import no.deichman.services.App;
import no.deichman.services.entity.EntityType;
import no.deichman.services.entity.ResourceBase;
import no.deichman.services.entity.kohaadapter.KohaSvcMock;
import no.deichman.services.entity.repository.InMemoryRepository;
import no.deichman.services.entity.z3950.MappingTester;
import no.deichman.services.entity.z3950.Z3950ServiceMock;
import no.deichman.services.ontology.AuthorizedValue;
import no.deichman.services.rdf.RDFModelUtil;
import no.deichman.services.services.search.EmbeddedElasticsearchServer;
import no.deichman.services.testutil.PortSelector;
import no.deichman.services.uridefaults.XURI;
import no.deichman.services.utils.ResourceReader;
import org.apache.commons.lang.StringEscapeUtils;
import org.apache.jena.query.QueryExecution;
import org.apache.jena.query.QueryExecutionFactory;
import org.apache.jena.query.QueryFactory;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Statement;
import org.apache.jena.riot.Lang;
import org.apache.jena.vocabulary.RDFS;
import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.client.Client;
import org.elasticsearch.index.query.QueryBuilders;
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
import java.net.URLEncoder;

import static java.net.HttpURLConnection.HTTP_OK;
import static javax.json.Json.createObjectBuilder;
import static javax.ws.rs.core.Response.Status.CREATED;
import static no.deichman.services.restutils.MimeType.LD_JSON;
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
    private static final int ONE_SECOND = 1000;
    private static final int TEN_TIMES = 10;
    private static final boolean SHOULD_NOT_FIND = true;
    private static final Logger LOG = LoggerFactory.getLogger(AppTest.class);
    private static final boolean USE_IN_MEMORY_REPO = true;
    private static final String LOCALHOST = "http://127.0.0.1";
    private static final String FIRST_BIBLIO_ID = "111111";
    private static final String SECOND_BIBLIO_ID = "222222";
    private static final String ANY_URI = "http://www.w3.org/2001/XMLSchema#anyURI";
    private static final String ANOTHER_BIBLIO_ID = "333333";
    private static final  String EMPTY_STRING = "";
    private static final String ADD = "ADD";
    private static final String DEL = "DEL";
    private static String baseUri;
    private static App app;

    private static KohaSvcMock kohaSvcMock;
    private static EmbeddedElasticsearchServer embeddedElasticsearchServer;
    private static int appPort;
    private static Z3950ServiceMock z3950ServiceMock;

    @BeforeClass
    public static void setUp() throws Exception {
        appPort = PortSelector.randomFree();
        int jamonAppPort = PortSelector.randomFree();
        kohaSvcMock = new KohaSvcMock();
        String svcEndpoint = LOCALHOST + ":" + kohaSvcMock.getPort();
        z3950ServiceMock = new Z3950ServiceMock();
        String z3950Endpoint = LOCALHOST + ":" + z3950ServiceMock.getPort();
        System.setProperty("Z3950_ENDPOINT", z3950Endpoint);
        System.setProperty("ELASTICSEARCH_URL", "http://localhost:9200");

        baseUri = LOCALHOST + ":" + appPort + "/";
        System.setProperty("DATA_BASEURI", baseUri);
        app = new App(appPort, svcEndpoint, USE_IN_MEMORY_REPO, jamonAppPort, z3950Endpoint);
        app.startAsync();

        setupElasticSearch();
    }

    private static void setupElasticSearch() throws Exception {
        embeddedElasticsearchServer = EmbeddedElasticsearchServer.getInstance();
        Unirest.post(baseUri + "/search/clear_index");
    }

    @AfterClass
    public static void tearDown() throws Exception {
        app.stop();
        embeddedElasticsearchServer.shutdown();
    }

    private static JsonObjectBuilder buildPatchStatement(String op, String s, String p, String o, String type) {
        return createObjectBuilder()
                .add("op", op).add("s", s).add("p", p).add("o", createObjectBuilder().add("value", o).add("type", type));
    }

    private static JsonObjectBuilder buildPatchStatement(String op, String s, String p, String o) {
        return createObjectBuilder()
                .add("op", op).add("s", s).add("p", p).add("o", createObjectBuilder().add("value", o));
    }

    private static JsonArrayBuilder buildContributorPatchStatement(String resource, String person) {
        return Json.createArrayBuilder()
                .add(createObjectBuilder()
                        .add("op", "add")
                        .add("s", resource).add("p", baseUri+"ontology#contributor")
                        .add("o", createObjectBuilder()
                                .add("value", "_:c1")
                                .add("type", ANY_URI)))
                .add(createObjectBuilder()
                        .add("op", "add")
                        .add("s", "_:c1")
                        .add("p", "http://www.w3.org/1999/02/22-rdf-syntax-ns#type")
                        .add("o", createObjectBuilder()
                                .add("value", baseUri+"ontology#Contribution")
                                .add("type", ANY_URI)))
                .add(createObjectBuilder()
                        .add("op", "add").add("s", "_:c1")
                        .add("p", baseUri+"ontology#role")
                        .add("o", createObjectBuilder()
                                .add("value", "http://data.deichman.no/role#author")
                                .add("type", ANY_URI)))
                .add(createObjectBuilder()
                        .add("op", "add").add("s", "_:c1")
                        .add("p", baseUri+"ontology#agent")
                        .add("o", createObjectBuilder()
                                .add("value", person)
                                .add("type", ANY_URI)));
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
        assertTrue("Not a URI: " + uri, uri.matches("(?:http|https)(?::/{2}[\\w]+)(?:[/|\\.]?)(?:[^\\s]*)"));
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

    private static HttpResponse<String> createEmptyResource(EntityType entityType) throws UnirestException {
        return buildCreateRequest(baseUri + entityType.getPath(), "{}").asString();
    }

    private static void setUpKohaExpectation(String biblioNumber) {
            kohaSvcMock.addLoginExpectation();
            kohaSvcMock.addCreateNewBiblioExpectation(biblioNumber);
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
        int attempts = TEN_TIMES;
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
            assertTrue("Work with given format found in index", true);
        } else if (foundWorkInIndex) {
            fail("Work found in index, but not with the correct format.");
        } else {
            fail("Work not found in index.");
        }
    }

    private void doSearchForWorksWithHoldingbranch(String name, String branch) throws UnirestException, InterruptedException {
        boolean foundWorkInIndex;
        boolean foundBranchInIndex;
        int attempts = TEN_TIMES;
        do {
            HttpRequest request = Unirest
                    .get(baseUri + "search/work/_search").queryString("q", "work.mainTitle=" + name);
            HttpResponse<?> response = request.asJson();
            assertResponse(Status.OK, response);
            String responseBody = response.getBody().toString();
            foundWorkInIndex = responseBody.contains(name);
            foundBranchInIndex = responseBody.contains(branch);
            if (!foundWorkInIndex || !foundBranchInIndex) {
                LOG.info("Work with given branch not found in index yet, waiting one second.");
                Thread.sleep(ONE_SECOND);
            }
        } while ((!foundWorkInIndex || !foundBranchInIndex) && attempts-- > 0);
        if (foundWorkInIndex && foundBranchInIndex) {
            assertTrue("Work with given branch found in index", true);
        } else if (foundWorkInIndex) {
            fail("Work found in index, but not with the correct branch.");
        } else {
            fail("Work not found in index.");
        }
    }

    @Test @Ignore("TODO")
    public void test_update_work_index_when_publication_is_updated() throws Exception {
        kohaSvcMock.addLoginExpectation();
        kohaSvcMock.addCreateNewBiblioExpectation(FIRST_BIBLIO_ID);

        final HttpResponse<JsonNode> createWorkResponse = buildEmptyCreateRequest(baseUri + "work").asJson();
        assertResponse(CREATED, createWorkResponse);
        final String workUri = getLocation(createWorkResponse);
        final JsonArray addNameToWorkPatch =
                buildLDPatch(buildPatchStatement("add", workUri, baseUri + "ontology#mainTitle", "Paris"));
        final HttpResponse<String> patchAddNameToWorkPatchResponse = buildPatchRequest(workUri, addNameToWorkPatch).asString();
        assertResponse(Status.OK, patchAddNameToWorkPatchResponse);

        final HttpResponse<JsonNode> createPublicationResponse = buildEmptyCreateRequest(baseUri + "publication").asJson();

        assertResponse(CREATED, createPublicationResponse);
        final String publicationUri = getLocation(createPublicationResponse);
        assertIsUri(publicationUri);
        assertThat(publicationUri, startsWith(baseUri));

        kohaSvcMock.addLenientUpdateExpectation(FIRST_BIBLIO_ID);
        final JsonArray addPublicationOfToPublicationPatch = buildLDPatch(buildPatchStatement("add", publicationUri, baseUri + "ontology#publicationOf", workUri, ANY_URI));
        final HttpResponse<String> patchAddPublicationOfToPublicationPatchResponse = buildPatchRequest(publicationUri, addPublicationOfToPublicationPatch).asString();
        assertResponse(Status.OK, patchAddPublicationOfToPublicationPatchResponse);

        kohaSvcMock.addLenientUpdateExpectation(FIRST_BIBLIO_ID);
        final JsonArray addFormatToPublicationPatch = buildLDPatch(buildPatchStatement("add", publicationUri, baseUri + "ontology#format", "http://data.deichman.no/format#Audiobook", ANY_URI));
        final HttpResponse<String> patchAddFormatToPublicationPatchResponse = buildPatchRequest(publicationUri, addFormatToPublicationPatch).asString();
        assertResponse(Status.OK, patchAddFormatToPublicationPatchResponse);

        final JsonArray addNameToWorkPatch1 = buildLDPatch(buildPatchStatement("add", workUri, baseUri + "ontology#partTitle", "Paris"));
        final HttpResponse<String> patchAddNameToWorkPatchResponse1 = buildPatchRequest(workUri, addNameToWorkPatch1).asString();
        assertResponse(Status.OK, patchAddNameToWorkPatchResponse1);


        doSearchForWorkWithFormat("Paris", "Audiobook");
    }

    @Test
    public void happy_day_scenario() throws Exception {

        kohaSvcMock.addLoginExpectation();
        kohaSvcMock.addCreateNewBiblioExpectation(FIRST_BIBLIO_ID);

        final HttpResponse<JsonNode> createPublicationResponse = buildEmptyCreateRequest(baseUri + "publication").asJson();

        assertResponse(CREATED, createPublicationResponse);
        final String publicationUri = getLocation(createPublicationResponse);
        assertIsUri(publicationUri);
        assertThat(publicationUri, startsWith(baseUri));

        final HttpResponse<JsonNode> createWorkResponse = buildEmptyCreateRequest(baseUri + "work").asJson();

        assertResponse(CREATED, createWorkResponse);
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
        assertResponse(CREATED, createPersonResponse);
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

        final JsonArray addCreatorToWorkPatch = buildContributorPatchStatement(workUri, personUri).build();
        final HttpResponse<String> patchAddCreatorToWorkPatchResponse = buildPatchRequest(workUri, addCreatorToWorkPatch).asString();
        assertResponse(Status.OK, patchAddCreatorToWorkPatchResponse);

        final JsonArray workIntoPublicationPatch = buildLDPatch(buildPatchStatement("add", publicationUri, baseUri + "ontology#publicationOf", workUri, ANY_URI));

        final HttpResponse<String> patchWorkIntoPublicationResponse = buildPatchRequest(publicationUri, workIntoPublicationPatch).asString();
        assertResponse(Status.OK, patchWorkIntoPublicationResponse);

        kohaSvcMock.addCreateNewBiblioExpectation(SECOND_BIBLIO_ID);

        final HttpResponse<JsonNode> createSecondPublicationResponse = buildEmptyCreateRequest(baseUri + "publication").asJson();
        assertResponse(CREATED, createSecondPublicationResponse);
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

        doSearchForPublicationByRecordId(FIRST_BIBLIO_ID);

        // delete publication
        kohaSvcMock.addGetBiblioExpandedExpectation(FIRST_BIBLIO_ID, "{\"items\":[]}");
        kohaSvcMock.addDeleteBibloExpectation(FIRST_BIBLIO_ID);
        assertEquals(Status.NO_CONTENT.getStatusCode(), buildDeleteRequest(publicationUri).getStatus());

        // delete work
        assertEquals(Status.NO_CONTENT.getStatusCode(), buildDeleteRequest(workUri).getStatus());
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
    public void place_resource_can_be_created_if_not_a_duplicate() throws UnirestException {
        String input = "<__BASEURI__externalPlace/g1234> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <__BASEURI__ontology#Place> .\n"
                + "<__BASEURI__externalPlace/g1234> <__BASEURI__ontology#prefLabel> \"Oslo\"^^<http://www.w3.org/1999/02/22-rdf-syntax-ns#plainLiteral> .\n"
                + "<__BASEURI__externalPlace/g1234> <http://data.deichman.no/duo#bibliofilPlaceId> \"1234\" .\n"
                + "<__BASEURI__externalPlace/g1234> <__BASEURI__ontology#specification> \"Norge\"^^<http://www.w3.org/1999/02/22-rdf-syntax-ns#plainLiteral> .\n";

        input = input.replace("__BASEURI__", baseUri);

        String duplicateInput = "<__BASEURI__externalPlace/g1234> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <__BASEURI__ontology#Place> .\n"
                + "<__BASEURI__externalPlace/g1234> <__BASEURI__ontology#prefLabel> \"Oslo\"^^<http://www.w3.org/1999/02/22-rdf-syntax-ns#plainLiteral> .\n"
                + "<__BASEURI__externalPlace/g1234> <http://data.deichman.no/duo#bibliofilPlaceId> \"1234\" .\n"
                + "<__BASEURI__externalPlace/g1234> <__BASEURI__ontology#specification> \"Norge\"^^<http://www.w3.org/1999/02/22-rdf-syntax-ns#plainLiteral> .\n";
        duplicateInput = duplicateInput.replace("__BASEURI__", baseUri);

        Model testModel = RDFModelUtil.modelFrom(input, Lang.NTRIPLES);
        String body = RDFModelUtil.stringFrom(testModel, Lang.JSONLD);

        Model testModel2 = RDFModelUtil.modelFrom(duplicateInput, Lang.NTRIPLES);
        String body2 = RDFModelUtil.stringFrom(testModel2, Lang.JSONLD);

        HttpResponse<String> result1 = buildCreateRequest(baseUri + "place", body).asString();
        HttpResponse<String> result2 = buildCreateRequest(baseUri + "place", body2).asString();

        assertResponse(Status.CONFLICT, result2);
        String location1 = getLocation(result1);
        String location2 = getLocation(result2);
        assertTrue(location1.equals(location2));
    }

    @Test
    public void place_is_patched() throws UnirestException {
        HttpResponse<String> result1 = buildCreateRequest(baseUri + "place", "{}").asString();
        String op = "ADD";
        String s = getLocation(result1);
        String p = baseUri + "ontology#prefLabel";
        String o = "Oslo";
        String type = "http://www.w3.org/2001/XMLSchema#string";
        JsonArray body = buildLDPatch(buildPatchStatement(op, s, p, o, type));
        HttpResponse<String> result2 = buildPatchRequest(s, body).asString();
        assertEquals(Status.OK.getStatusCode(), result2.getStatus());
    }


    @Test
    public void place_is_deleted() throws UnirestException {
        HttpResponse<String> result1 = buildCreateRequest(baseUri + "place", "{}").asString();
        HttpResponse<String> result2 = buildDeleteRequest(getLocation(result1));
        assertEquals(Status.NO_CONTENT.getStatusCode(), result2.getStatus());
    }

    @Test
    public void place_is_searchable() throws UnirestException, InterruptedException {
        HttpResponse<String> result1 = buildCreateRequest(baseUri + "place", "{}").asString();

        String op = "ADD";
        String s = getLocation(result1);
        String p1 = baseUri + "ontology#prefLabel";
        String o1 = "Oslo";
        String type = "http://www.w3.org/2001/XMLSchema#string";
        String p2 = baseUri + "ontology#specification";
        String o2 = "Norway";

        JsonArray body = Json.createArrayBuilder()
                .add(buildLDPatch(buildPatchStatement(op, s, p1, o1, type)).get(0))
                .add(buildLDPatch(buildPatchStatement(op, s, p2, o2, type)).get(0))
                .build();

        HttpResponse<String> result2 = buildPatchRequest(s, body).asString();
        assertEquals(Status.OK.getStatusCode(), result2.getStatus());
        doSearchForPlace("Oslo");
    }

    @Test
    public void compositiontype_is_searchable() throws UnirestException, InterruptedException {
        HttpResponse<String> result1 = buildCreateRequest(baseUri + "compositiontype", "{}").asString();

        String op = "ADD";
        String s = getLocation(result1);
        String p1 = baseUri + "ontology#prefLabel";
        String o1 = "Menuette";
        String type = "http://www.w3.org/2001/XMLSchema#string";
        String p2 = baseUri + "ontology#specification";
        String o2 = "Posh dance";

        JsonArray body = Json.createArrayBuilder()
                .add(buildLDPatch(buildPatchStatement(op, s, p1, o1, type)).get(0))
                .add(buildLDPatch(buildPatchStatement(op, s, p2, o2, type)).get(0))
                .build();

        HttpResponse<String> result2 = buildPatchRequest(s, body).asString();
        assertEquals(Status.OK.getStatusCode(), result2.getStatus());
        doSearchForCompositionType("Menuette");
    }

    @Test
    public void serial_is_searchable() throws UnirestException, InterruptedException {
        HttpResponse<String> result1 = buildCreateRequest(baseUri + "serial", "{}").asString();

        String op = "ADD";
        String s = getLocation(result1);
        String p1 = baseUri + "ontology#name";
        String o1 = "Morgan Kane";
        String type = "http://www.w3.org/2001/XMLSchema#string";

        JsonArray body = Json.createArrayBuilder()
                .add(buildLDPatch(buildPatchStatement(op, s, p1, o1, type)).get(0))
                .build();

        HttpResponse<String> result2 = buildPatchRequest(s, body).asString();
        assertEquals(Status.OK.getStatusCode(), result2.getStatus());
        doSearchForSerial("Morgan Kane");
    }

    @Test
    public void subject_is_searchable() throws UnirestException, InterruptedException {
        HttpResponse<String> result1 = buildCreateRequest(baseUri + "subject", "{}").asString();

        String op = "ADD";
        String s = getLocation(result1);
        String p1 = baseUri + "ontology#prefLabel";
        String o1 = "Knitting";
        String type = "http://www.w3.org/2001/XMLSchema#string";

        JsonArray body = Json.createArrayBuilder()
                .add(buildLDPatch(buildPatchStatement(op, s, p1, o1, type)).get(0))
                .build();

        HttpResponse<String> result2 = buildPatchRequest(s, body).asString();
        assertEquals(Status.OK.getStatusCode(), result2.getStatus());
        doSearchForSubject("Knitting");
    }

    @Test
    public void genre_is_searchable() throws UnirestException, InterruptedException {
        HttpResponse<String> result1 = buildCreateRequest(baseUri + "genre", "{}").asString();

        String op = "ADD";
        String s = getLocation(result1);
        String p1 = baseUri + "ontology#prefLabel";
        String o1 = "Romance";
        String type = "http://www.w3.org/2001/XMLSchema#string";

        JsonArray body = Json.createArrayBuilder()
                .add(buildLDPatch(buildPatchStatement(op, s, p1, o1, type)).get(0))
                .build();

        HttpResponse<String> result2 = buildPatchRequest(s, body).asString();
        assertEquals(Status.OK.getStatusCode(), result2.getStatus());
        doSearchForGenre("Romance");
    }

    @Test
    public void event_is_searchable() throws UnirestException, InterruptedException {
        HttpResponse<String> result1 = buildCreateRequest(baseUri + "event", "{}").asString();

        String op = "ADD";
        String s = getLocation(result1);
        String p1 = baseUri + "ontology#prefLabel";
        String o1 = "Menuette";
        String type = "http://www.w3.org/2001/XMLSchema#string";
        String p2 = baseUri + "ontology#specification";
        String o2 = "Posh dance";

        JsonArray body = Json.createArrayBuilder()
                .add(buildLDPatch(buildPatchStatement(op, s, p1, o1, type)).get(0))
                .add(buildLDPatch(buildPatchStatement(op, s, p2, o2, type)).get(0))
                .build();

        HttpResponse<String> result2 = buildPatchRequest(s, body).asString();
        assertEquals(Status.OK.getStatusCode(), result2.getStatus());
        doSearchForEvent("Menuette");
    }


    @Test
    public void test_resource_is_patchable() throws Exception {
        for (EntityType entityType : EntityType.values()) {
            if (entityType.equals(EntityType.PUBLICATION)) {
                setUpKohaExpectation(SECOND_BIBLIO_ID);
            }
            HttpResponse<String> createResult = createEmptyResource(entityType);
            XURI location = new XURI(getLocation(createResult));
            HttpResponse<String> addResult = buildPatchRequest(location.getUri(), createSimplePatch(ADD, location)).asString();
            assertEquals("expected OK when creating " + entityType + " but got " + addResult.getStatus(), Status.OK.getStatusCode(), addResult.getStatus());
            HttpResponse<String> delResult = buildPatchRequest(location.getUri(), createSimplePatch(DEL, location)).asString();
            assertEquals(Status.OK.getStatusCode(), delResult.getStatus());
        }
    }

    private JsonArray createSimplePatch(String operation, XURI xuri) throws Exception {

        if (!operation.matches("ADD|DEL")) {
            throw new Exception("You did not specify a valid patch operation (ADD|DEL)");
        }

        String s = xuri.getUri();
        String p1 = baseUri + "ontology#prefLabel";
        String o1 = "TestTestTest";
        String type = "http://www.w3.org/2001/XMLSchema#string";

        return Json.createArrayBuilder()
                .add(buildLDPatch(buildPatchStatement(operation, s, p1, o1, type)).get(0))
                .build();
    }

    @Test
    public void test_resource_can_be_created() throws UnirestException {

        for (EntityType entityType : EntityType.values()) {

            if (entityType.equals(EntityType.PUBLICATION)) {
                setUpKohaExpectation(SECOND_BIBLIO_ID);
            }

            System.out.println("Testing resource creation for " + entityType.name());
            HttpResponse<String> result = createEmptyResource(entityType);
            assertEquals(Status.CREATED.getStatusCode(), result.getStatus());
            assertEquals(EMPTY_STRING, result.getBody());
        }
    }

    @Test
    public void test_patching_with_bnodes() throws UnirestException {
        HttpResponse<String> result1 = buildCreateRequest(baseUri + "place", "{}").asString();
        String op = "ADD";
        String s = getLocation(result1);
        String p1 = baseUri + "ontology#place";
        String o1 = "_:b0";
        String type = ANY_URI;
        String p2 = baseUri + "ontology#prefLabel";
        String o2 = "Norway";

        JsonArray body = Json.createArrayBuilder()
                .add(buildLDPatch(buildPatchStatement(op, s, p1, o1, type)).get(0))
                .add(buildLDPatch(buildPatchStatement(op, o1, p2, o2)).get(0))
                .build();
        HttpResponse<String> result2 = buildPatchRequest(s, body).asString();

        assertEquals(Status.OK.getStatusCode(), result2.getStatus());
    }

    @Test
    public void test_deletion_of_bnodes() throws UnirestException {
        HttpResponse<String> result1 = buildCreateRequest(baseUri + "place", "{}").asString();
        String op = ADD;
        String s = getLocation(result1);
        String p1 = baseUri + "ontology#place";
        String o1 = "_:b0";
        String type = ANY_URI;
        String p2 = baseUri + "ontology#prefLabel";
        String o2 = "Norway";

        JsonArray addBody = Json.createArrayBuilder()
                .add(buildLDPatch(buildPatchStatement(op, s, p1, o1, type)).get(0))
                .add(buildLDPatch(buildPatchStatement(op, o1, p2, o2)).get(0))
                .build();
        HttpResponse<String> result2 = buildPatchRequest(s, addBody).asString();

        assertEquals(Status.OK.getStatusCode(), result2.getStatus());

        JsonArray delBody = Json.createArrayBuilder()
                .add(buildLDPatch(buildPatchStatement(DEL, s, p1, o1, type)).get(0))
                .add(buildLDPatch(buildPatchStatement(DEL, o1, p2, o2)).get(0))
                .build();
        HttpResponse<String> result3 = buildPatchRequest(s, delBody).asString();

        assertEquals(Status.OK.getStatusCode(), result3.getStatus());
    }

    private HttpResponse<String> buildDeleteRequest(String location) throws UnirestException {
        return Unirest
                .delete(location).asString();
    }

    @Test
    public void serial_resource_can_be_created() throws UnirestException {
        String input = "<__BASEURI__serial/s1234> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <__BASEURI__ontology#Serial> .\n"
                + "<__BASEURI__serial/s1234> <__BASEURI__ontology#name> \"Serial name\"^^<http://www.w3.org/1999/02/22-rdf-syntax-ns#plainLiteral> .\n";
        input = input.replace("__BASEURI__", baseUri);

        Model testModel = RDFModelUtil.modelFrom(input, Lang.NTRIPLES);
        String body = RDFModelUtil.stringFrom(testModel, Lang.JSONLD);

        HttpResponse<String> result = buildCreateRequest(baseUri + "serial", body).asString();

        assertResponse(CREATED, result);
    }

    @Test
    public void corporation_is_patched() throws UnirestException {
        HttpResponse<String> result1 = buildCreateRequest(baseUri + "corporation", "{}").asString();
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
    public void place_of_corporation_is_deleted() throws UnirestException {
        HttpResponse<String> result1 = buildCreateRequest(baseUri + "corporation", "{}").asString();
        HttpResponse<String> result2 = buildDeleteRequest(getLocation(result1));
        assertEquals(Status.NO_CONTENT.getStatusCode(), result2.getStatus());
    }

    @Test
    public void get_authorized_values() throws Exception {

        for (AuthorizedValue authorizedValue : AuthorizedValue.values()) {
            HttpRequest authorizedValueRequest = Unirest
                    .get(baseUri + "authorized_values/" + authorizedValue.getPath())
                    .header("Accept", LD_JSON);
            HttpResponse<?> authorizedValueResponse = authorizedValueRequest.asString();
            System.out.println("Testing authorized value: " + authorizedValue.getPath());
            assertResponse(Status.OK, authorizedValueResponse);
            Model test = RDFModelUtil.modelFrom(authorizedValueResponse.getBody().toString(), Lang.JSONLD);
            assertTrue(authorizedValue.getPath() + " response didn't contain expected data", test.containsAll(getAuthorizedValueTestData(authorizedValue)));

        }

    }

    public Model getAuthorizedValueTestData(AuthorizedValue authorizedValue) throws Exception {

        String testData;
        switch (authorizedValue) {
            case FORMAT_ADAPTATION:
                testData = "<http://data.deichman.no/formatAdaptation#capitalLetters> <http://www.w3.org/2000/01/rdf-schema#label> \"Capital letters only\"@en .";
                break;
            case CONTENT_ADAPTATION:
                testData = "<http://data.deichman.no/contentAdaptation#easyLanguage> <http://www.w3.org/2000/01/rdf-schema#label> \"Easy to read, easy language\"@en .";
                break;
            case AUDIENCE:
                testData = "<http://data.deichman.no/audience#adult> <http://www.w3.org/2000/01/rdf-schema#label> \"Adults\"@en .";
                break;
            case BINDING:
                testData = "<http://data.deichman.no/binding#innbundet> <http://www.w3.org/2000/01/rdf-schema#label> \"Hardback\"@en .";
                break;
            case BIOGRAPHY:
                testData = "<http://data.deichman.no/biography#biographicalContent> <http://www.w3.org/2000/01/rdf-schema#label> \"Biographical content\"@en .";
                break;
            case FORMAT:
                testData = "<http://data.deichman.no/format#DVD> <http://www.w3.org/2000/01/rdf-schema#label> \"DVD\"@en .";
                break;
            case ILLUSTRATIVE_MATTER:
                testData = "<http://data.deichman.no/illustrativeMatter#illustrert> <http://www.w3.org/2000/01/rdf-schema#label> \"Illustration\"@en .";
                break;
            case LANGUAGE:
                testData = "<http://lexvo.org/id/iso639-3/afr> <http://www.w3.org/2000/01/rdf-schema#label> \"Afrikaans\"@en .";
                break;
            case LITERARY_FORM:
                testData = "<http://data.deichman.no/literaryForm#nonfiction> <http://www.w3.org/2000/01/rdf-schema#label> \"Nonfiction\"@en .";
                break;
            case MEDIA_TYPE:
                testData = "<http://data.deichman.no/mediaType#Book> <http://www.w3.org/2000/01/rdf-schema#label> \"Book\"@en .";
                break;
            case NATIONALITY:
                testData = "<http://data.deichman.no/nationality#aborig> <http://www.w3.org/2000/01/rdf-schema#label> \"Aboriginal Australian\"@en .";
                break;
            case ROLE:
                testData = "<http://data.deichman.no/role#scriptWriter> <http://www.w3.org/2000/01/rdf-schema#label> \"Script writer\"@en .";
                break;
            case WRITING_SYSTEM:
                testData = "<http://data.deichman.no/writingSystem#cyrillic> <http://www.w3.org/2000/01/rdf-schema#label> \"Cyrillic\"@en .";
                break;
            case RELATION_TYPE:
                testData = "<http://data.deichman.no/relationType#basedOn> <http://www.w3.org/2000/01/rdf-schema#label> \"Based on\"@en .";
                break;
            case DEWEY_EDITION:
                testData = "<http://data.deichman.no/classificationSource#ddk5> <http://www.w3.org/2000/01/rdf-schema#label> \"DDK 5\"@en .";
                break;
            case MUSICAL_KEY:
                testData = "<http://data.deichman.no/key#cb_major> <http://www.w3.org/2000/01/rdf-schema#label> \"C♭-dur\"@no .";
                break;
            case WORK_TYPE:
                testData = "<http://data.deichman.no/workType#Literature> <http://www.w3.org/2000/01/rdf-schema#label> \"Litteratur\"@no .";
                break;
            default:
                throw new Exception("Couldn't find test data for authorized value: " + authorizedValue.getPath());
        }
        return RDFModelUtil.modelFrom(testData, Lang.NTRIPLES);
    }

    @Test
    public void get_ontology() throws Exception {
        HttpRequest request = Unirest
                .get(baseUri + "ontology")
                .header("Accept", LD_JSON);
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
    public void when_get_elasticsearch_work_should_return_something() throws Exception {
        indexWork("1", "Sult");
        doSearchForWorks("Sult");
    }

    private void doSearchForWorks(String name, boolean... invert) throws UnirestException, InterruptedException {
        boolean foundWorkInIndex;
        boolean doInvert = invert != null && invert.length > 0 && invert[0];
        int attempts = TEN_TIMES;
        do {
            HttpRequest request = Unirest
                    .get(baseUri + "search/work/_search").queryString("q", "mainTitle=" + name);
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
                    .get(baseUri + "search/person/_search").queryString("q", "name:" + name);
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

    private void doSearchForPlace(String place) throws UnirestException, InterruptedException {
        boolean foundPlaceInIndex;
        int attempts = TEN_TIMES;
        do {
            HttpRequest request = Unirest.get(baseUri + "search/place/_search").queryString("q", "prefLabel:" + place);
            HttpResponse<?> response = request.asJson();
            String responseBody = response.getBody().toString();
            foundPlaceInIndex = responseBody.contains(place);
            if (!foundPlaceInIndex) {
                LOG.info("Place not found in index yet, waiting one second");
                Thread.sleep(ONE_SECOND);
            }
        } while (!foundPlaceInIndex && attempts-- > 0);

        assertTrue("Should have found place of publication in index by now", foundPlaceInIndex);
    }

    private void doSearchForCompositionType(String compositionType) throws UnirestException, InterruptedException {
        boolean foundCompositionTypeInIndex;
        int attempts = TEN_TIMES;
        do {
            HttpRequest request = Unirest.get(baseUri + "search/compositiontype/_search").queryString("q", "prefLabel:" + compositionType);
            HttpResponse<?> response = request.asJson();
            String responseBody = response.getBody().toString();
            foundCompositionTypeInIndex = responseBody.contains(compositionType);
            if (!foundCompositionTypeInIndex) {
                LOG.info("CompositionType not found in index yet, waiting one second");
                Thread.sleep(ONE_SECOND);
            }
        } while (!foundCompositionTypeInIndex && attempts-- > 0);

        assertTrue("Should have found compositionType of publication in index by now", foundCompositionTypeInIndex);
    }

    private void doSearchForSerial(String name) throws UnirestException, InterruptedException {
        boolean foundSerial;
        int attempts = TEN_TIMES;
        do {
            HttpRequest request = Unirest.get(baseUri + "search/serial/_search").queryString("q", "name:" + name);
            HttpResponse<?> response = request.asJson();
            String responseBody = response.getBody().toString();
            foundSerial = responseBody.contains(name);
            if (!foundSerial) {
                LOG.info("Serial not found in index yet, waiting one second");
                Thread.sleep(ONE_SECOND);
            }
        } while (!foundSerial && attempts-- > 0);

        assertTrue("Should have found name of serial in index by now", foundSerial);
    }

    private void doSearchForPublicationByRecordId(String recordId) throws UnirestException, InterruptedException {
        boolean foundPublication;
        int attempts = TEN_TIMES;
        do {
            HttpRequest request = Unirest.get(baseUri + "search/publication/_search").queryString("q", "recordId:" + recordId);
            HttpResponse<?> response = request.asJson();
            String responseBody = response.getBody().toString();
            foundPublication = responseBody.contains(recordId);
            if (!foundPublication) {
                LOG.info("Serial not found in index yet, waiting one second");
                Thread.sleep(ONE_SECOND);
            }
        } while (!foundPublication && attempts-- > 0);

        assertTrue("Should have found recordId of publication in index by now", foundPublication);
    }

    private void doSearchForSubject(String name) throws UnirestException, InterruptedException {
        boolean foundSubject;
        int attempts = TEN_TIMES;
        do {
            HttpRequest request = Unirest.get(baseUri + "search/subject/_search").queryString("q", "prefLabel:" + name);
            HttpResponse<?> response = request.asJson();
            String responseBody = response.getBody().toString();
            foundSubject = responseBody.contains(name);
            if (!foundSubject) {
                LOG.info("Subject not found in index yet, waiting one second");
                Thread.sleep(ONE_SECOND);
            }
        } while (!foundSubject && attempts-- > 0);

        assertTrue("Should have found name of subject in index by now", foundSubject);
    }

    private void doSearchForGenre(String name) throws UnirestException, InterruptedException {
        boolean foundSubject;
        int attempts = TEN_TIMES;
        do {
            HttpRequest request = Unirest.get(baseUri + "search/genre/_search").queryString("q", "prefLabel:" + name);
            HttpResponse<?> response = request.asJson();
            String responseBody = response.getBody().toString();
            foundSubject = responseBody.contains(name);
            if (!foundSubject) {
                LOG.info("Genre not found in index yet, waiting one second");
                Thread.sleep(ONE_SECOND);
            }
        } while (!foundSubject && attempts-- > 0);

        assertTrue("Should have found name of genre in index by now", foundSubject);
    }

    private void doSearchForEvent(String event) throws UnirestException, InterruptedException {
        boolean foundEventInIndex;
        int attempts = TEN_TIMES;
        do {
            HttpRequest request = Unirest.get(baseUri + "search/event/_search").queryString("q", "prefLabel:" + event);
            HttpResponse<?> response = request.asJson();
            String responseBody = response.getBody().toString();
            foundEventInIndex = responseBody.contains(event);
            if (!foundEventInIndex) {
                LOG.info("Event not found in index yet, waiting one second");
                Thread.sleep(ONE_SECOND);
            }
        } while (!foundEventInIndex && attempts-- > 0);

        assertTrue("Should have found event of publication in index by now", foundEventInIndex);
    }


    private void indexWork(String workId, String title) {
        getClient().prepareIndex("search", "work", workId)
                .setSource(""
                        + "{ "
                        + "    \"mainTitle\": \"" + title + "\","
                        + "    \"publicationYear\": \"1890\","
                        + "    \"uri\": \"http://deichman.no/work/w12344553\","
                        + "    \"contributor\": [{ \"role\": \"http://data.deichman.no/role#author\", \"agent\":{"
                        + "       \"name\": \"Knut Hamsun\","
                        + "       \"birthYear\": \"1859\","
                        + "       \"deathYear\": \"1952\","
                        + "       \"uri\": \"http://deichman.no/person/h12345\"}"
                        + "    }]"
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

    private Client getClient() {
        return embeddedElasticsearchServer.getClient();
    }

    @Test
    public void correct_marc_xml_gets_sent_to_koha_on_create_publication() throws UnirestException {
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
                + "<http://host/publication/p1> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <" + ontologyURI + "Publication> .\n"
                + "<http://host/publication/p1> <" + ontologyURI + "mainTitle> \"" + publicationTitle + "\" .\n"
                + "<http://host/publication/p1> <" + ontologyURI + "partTitle> \"" + partTitle + "\" .\n"
                + "<http://host/publication/p1> <" + ontologyURI + "publicationOf> <__WORKURI__> .\n"
                + "<http://host/publication/p1> <" + ontologyURI + "partNumber> \"" + partNumber + "\" .\n"
                + "<http://host/publication/p1> <" + ontologyURI + "isbn> \"" + isbn + "\" .\n"
                + "<http://host/publication/p1> <" + ontologyURI + "publicationYear> \"" + publicationYear + "\" .\n";

        HttpResponse<JsonNode> createpublicationResponse = buildCreateRequestNtriples(baseUri + "publication", publicationTriples.replace("__WORKURI__", workUri)).asJson();
        assertNotNull(getLocation(createpublicationResponse));
    }

    private String createWorkInRdfStore(String workTitle, String ontologyURI, String personUri) throws UnirestException {
        String workTriples = ""
                + "<http://host/work/w1> <" + ontologyURI + "mainTitle> \"" + workTitle + "\" .\n"
                + "<http://host/work/w1> <" + ontologyURI + "publicationYear> \"2011\"^^<http://www.w3.org/2001/XMLSchema#gYear> ."
                + "<http://host/work/w1> <" + ontologyURI + "contributor> _:b1 .\n"
                + "_:b1 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <" + ontologyURI + "Contribution> .\n"
                + "_:b1 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <" + ontologyURI + "MainEntry> .\n"
                + "_:b1  <" + ontologyURI + "role> <http://data.deichman.no/role#author> .\n"
                + "_:b1  <" + ontologyURI + "agent> <__CREATORURI__> .\n";
        HttpResponse<JsonNode> createworkResponse = buildCreateRequestNtriples(baseUri + "work", workTriples.replace("__CREATORURI__", personUri)).asJson();
        return getLocation(createworkResponse);
    }

    private String createPersonInRdfStore(String person, String ontologyURI) throws UnirestException {
        String personTriples = ""
                + "<http://host/person/h1> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <" + ontologyURI + "Person> .\n"
                + "<http://host/person/h1> <" + ontologyURI + "name> \"" + person + "\" .";
        HttpResponse<JsonNode> createPersonResponse = buildCreateRequestNtriples(baseUri + "person", personTriples).asJson();
        return getLocation(createPersonResponse);
    }

    private String createSubjectInRdfStore(String subject, String ontologyURI) throws UnirestException {
        String subjectTriples = ""
                + "<http://host/subject/s1> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <" + ontologyURI + "Subject> .\n"
                + "<http://host/subject/s1> <" + ontologyURI + "prefLabel> \"" + subject + "\" .";
        HttpResponse<JsonNode> createSubjectResponse = buildCreateRequestNtriples(baseUri + "subject", subjectTriples).asJson();
        return getLocation(createSubjectResponse);
    }

    private void setupExpectationForMarcXmlSentToKoha(String creator, String publicationTitle, String partTitle, String partNumber, String isbn, String publicationYear) {
        // TODO MARC XML can end up in any order, need a better comparison method for expected MARC XML
        String expectedPayload = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
                + "<marcxml:collection xmlns:marcxml=\"http://www.loc.gov/MARC21/slim\">"
                + "<marcxml:record><marcxml:leader>00000    a2200000       </marcxml:leader>"
                + "<marcxml:datafield tag=\"100\" ind1=\" \" ind2=\" \">"
                + "<marcxml:subfield code=\"a\">" + creator + "</marcxml:subfield></marcxml:datafield>"
                + "<marcxml:datafield tag=\"020\" ind1=\" \" ind2=\" \">"
                + "<marcxml:subfield code=\"a\">" + isbn + "</marcxml:subfield></marcxml:datafield>"
                + "<marcxml:datafield tag=\"245\" ind1=\" \" ind2=\" \">"
                + "<marcxml:subfield code=\"n\">" + partNumber + "</marcxml:subfield>"
                + "<marcxml:subfield code=\"p\">" + partTitle + "</marcxml:subfield>"
                + "<marcxml:subfield code=\"a\">" + publicationTitle + "</marcxml:subfield></marcxml:datafield>"
                + "<marcxml:datafield tag=\"260\" ind1=\" \" ind2=\" \">"
                + "<marcxml:subfield code=\"c\">" + publicationYear + "</marcxml:subfield></marcxml:datafield>"
                + "</marcxml:record></marcxml:collection>\n";
        kohaSvcMock.addCreateNewBiblioFromMarcXmlExpectation(FIRST_BIBLIO_ID, expectedPayload);
    }

    @Test
    public void should_return_marc_xml_for_existing_biblio_id() throws UnirestException, IOException {
        kohaSvcMock.addLoginExpectation();
        kohaSvcMock.addCreateNewBiblioExpectation(FIRST_BIBLIO_ID);

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
        String resp = "{ \"marcxml\": \"" + StringEscapeUtils.escapeJava(expected) + "\"}";

        HttpResponse<String> response = buildEmptyCreateRequest(baseUri + "publication").asString();
        String location = getLocation(response);

        final HttpResponse<JsonNode> getPublication = buildGetRequest(location).asJson();

        Model model = RDFModelUtil.modelFrom(getPublication.getBody().toString(), Lang.JSONLD);
        final String[] recordId = new String[1];
        model.listObjectsOfProperty(createProperty(baseUri + "ontology#recordID")).forEachRemaining(s -> recordId[0] = s.asLiteral().toString());

        kohaSvcMock.addGetBiblioExpectation(recordId[0], resp);
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

    @Test
    public void when_index_is_cleared_and_reindexed_subjects_are_found() throws Exception {
        createSubjectInRdfStore("Hekling", baseUri + "ontology#");
        HttpResponse<String> response = Unirest.post(baseUri + "search/clear_index").asString();
        assertEquals(HTTP_OK, response.getStatus());
        Unirest.post(baseUri + "search/subject/reindex_all").asString();
        doSearchForSubject("Hekling");
    }

    @Test
    public void work_is_reindexed_by_publication_recordid() throws Exception {
        String creator = "Knut Hamsun";
        String workTitle = "Hunger";
        String publicationTitle = "Sult";
        String partTitle = "Svolten";
        String partNumber = "Part 1";
        String isbn = "978-3-16-148410-0";
        String publicationYear = "2016";
        String ontologyURI = baseUri + "ontology#";

        kohaSvcMock.addLoginExpectation();
        setupExpectationForMarcXmlSentToKoha(creator, publicationTitle, partTitle, partNumber, isbn, publicationYear);

        String personUri = createPersonInRdfStore(creator, ontologyURI);
        String workUri = createWorkInRdfStore(workTitle, ontologyURI, personUri);
        String publicationTriples = ""
                + "<http://host/publication/p1> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <" + ontologyURI + "Publication> .\n"
                + "<http://host/publication/p1> <" + ontologyURI + "mainTitle> \"" + publicationTitle + "\" .\n"
                + "<http://host/publication/p1> <" + ontologyURI + "partTitle> \"" + partTitle + "\" .\n"
                + "<http://host/publication/p1> <" + ontologyURI + "publicationOf> <" + workUri + "> .\n"
                + "<http://host/publication/p1> <" + ontologyURI + "partNumber> \"" + partNumber + "\" .\n"
                + "<http://host/publication/p1> <" + ontologyURI + "isbn> \"" + isbn + "\" .\n"
                + "<http://host/publication/p1> <" + ontologyURI + "hasHoldingBranch> \"hutl\" .\n"
                + "<http://host/publication/p1> <" + ontologyURI + "publicationYear> \"" + publicationYear + "\" .\n";

        HttpResponse<JsonNode> createPublicationResponse = buildCreateRequestNtriples(baseUri + "publication", publicationTriples).asJson();
        assertResponse(CREATED, createPublicationResponse);

        HttpResponse<String> stringHttpResponse = Unirest.put(workUri + "/index").asString();
        assertNotNull(stringHttpResponse);

        doSearchForWorksWithHoldingbranch("Hunger", "hutl");

        stringHttpResponse = Unirest.post(baseUri + "search/work/reindex")
                .queryString("recordId", FIRST_BIBLIO_ID)
                .queryString("branches", "fgry").asString();
        assertNotNull(stringHttpResponse);

        doSearchForWorksWithHoldingbranch("Hunger", "fgry");
    }

    @Test
    public void resources_are_reindexed_when_themself_or_connected_resources_are_changed() throws Exception {
        kohaSvcMock.addLoginExpectation(); // TODO understand why needed here

        InMemoryRepository repo = ResourceBase.getInMemoryRepository();
        String data = new ResourceReader().readFile("searchsynctestdata.ttl").replaceAll("__PORT__", String.valueOf(appPort));
        repo.createResource(RDFModelUtil.modelFrom(data, Lang.TTL));

        String workUri = "http://127.0.0.1:" + appPort + "/work/w4e5db3a95caa282e5968f68866774e20";
        String pubUri1 = "http://127.0.0.1:" + appPort + "/publication/p594502562255";
        String pubUri2 = "http://127.0.0.1:" + appPort + "/publication/p735933031021";
        String persUri1 = "http://127.0.0.1:" + appPort + "/person/h10834700";
        String persUri2 = "http://127.0.0.1:" + appPort + "/person/h11234";
        String subjUri = "http://127.0.0.1:" + appPort + "/subject/e1200005";

        // 1 ) Verify that resources exist in triplestore:

        assertTrue(repo.askIfResourceExists(new XURI(workUri)));
        assertTrue(repo.askIfResourceExists(new XURI(pubUri1)));
        assertTrue(repo.askIfResourceExists(new XURI(pubUri2)));
        assertTrue(repo.askIfResourceExists(new XURI(persUri1)));
        assertTrue(repo.askIfResourceExists(new XURI(persUri2)));
        assertTrue(repo.askIfResourceExists(new XURI(subjUri)));

        // 2) Verify that none of the resources are indexed:

        assertFalse(resourceIsIndexed(workUri));
        assertFalse(resourceIsIndexed(pubUri1));
        assertFalse(resourceIsIndexed(pubUri2));
        assertFalse(resourceIsIndexed(persUri1));
        assertFalse(resourceIsIndexed(persUri2));
        assertFalse(resourceIsIndexed(subjUri));

        // 3) Patch work, and verify that work and its publications getByIsbn indexed within 2 seconds:

        buildPatchRequest(
                workUri,
                buildLDPatch(
                        buildPatchStatement("add", workUri, baseUri + "ontology#partTitle", "æøå"))).asString();

        assertTrue(resourceIsIndexedWithinNumSeconds(workUri, 2));
        assertTrue(resourceIsIndexedWithinNumSeconds(pubUri1, 2));
        assertTrue(resourceIsIndexedWithinNumSeconds(pubUri2, 2));

        // 4) Patch publication, and verify that publication and work getByIsbn reindexed within 2 seconds:

        buildPatchRequest(
                pubUri1,
                buildLDPatch(
                        buildPatchStatement("add", pubUri1, baseUri + "ontology#hasHoldingBranch", "branch_xyz123"))).asString();

        assertTrue(resourceIsIndexedWithValueWithinNumSeconds(workUri, "branch_xyz123", 2));
        assertTrue(resourceIsIndexedWithValueWithinNumSeconds(pubUri1, "branch_xyz123", 2));

        // 5) Patch person, and verify that work and publications getByIsbn reindexed within few seconds
        buildPatchRequest(
                persUri1,
                buildLDPatch(
                        buildPatchStatement("del", persUri1, baseUri + "ontology#name", "Ragde, Anne B."),
                        buildPatchStatement("add", persUri1, baseUri + "ontology#name", "Zappa, Frank"))).asString();

        assertTrue(resourceIsIndexedWithValueWithinNumSeconds(workUri, "Zappa, Frank", 2));
        assertTrue(resourceIsIndexedWithValueWithinNumSeconds(pubUri1, "Zappa, Frank", 2));
        assertTrue(resourceIsIndexedWithValueWithinNumSeconds(pubUri2, "Zappa, Frank", 2));

        // TODO also reindex by changes in subject resource
    }

    @Test
    public void test_z3950_resource_is_retrieved_and_mapped() throws UnirestException {
        z3950ServiceMock.getSingleMarcRecordExpectation();

        String url = baseUri + "/datasource/bibbi/isbn/912312312312";

        HttpResponse<String> result = Unirest.get(url).asString();

        Gson gson = new GsonBuilder().setPrettyPrinting().create();
        MappingTester mappingTester = new MappingTester();
        String resultJson = mappingTester.simplifyBNodes(gson.toJson(new JsonParser().parse(result.getBody()).getAsJsonObject()));
        String comparisonJson = mappingTester.simplifyBNodes(new ResourceReader().readFile("BS_external_data_processed.json"));

        assertEquals(comparisonJson, resultJson);
    }

    private Boolean resourceIsIndexed(String uri) throws Exception {
        String uriEncoded = URLEncoder.encode(uri, "UTF-8");
        SearchResponse res = EmbeddedElasticsearchServer.getInstance().getClient()
                .prepareSearch().setQuery(QueryBuilders.idsQuery().addIds(uriEncoded))
                .execute().actionGet();

        return res.getHits().getTotalHits() > 0;
    }

    private Boolean resourceIsIndexedWithValue(String uri, String value) throws Exception {
        String uriEncoded = URLEncoder.encode(uri, "UTF-8");
        SearchResponse res = EmbeddedElasticsearchServer.getInstance().getClient()
                .prepareSearch().setQuery(QueryBuilders.idsQuery().addIds(uriEncoded))
                .execute().actionGet();

        return res.toString().contains(value);
    }

    private Boolean resourceIsIndexedWithinNumSeconds(String uri, Integer numSeconds) throws Exception {
        Integer c = 0;
        while(c <= numSeconds) {
            if (resourceIsIndexed(uri)) {
                return true;
            }
            Thread.sleep(ONE_SECOND);
            c++;
        }
        return false;
    }

    private Boolean resourceIsIndexedWithValueWithinNumSeconds(String uri, String value, Integer numSeconds) throws Exception {
        Integer c = 0;
        while(c <= numSeconds) {
            if (resourceIsIndexedWithValue(uri, value)) {
                return true;
            }
            Thread.sleep(ONE_SECOND);
            c++;
        }
        return false;
    }
}
