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
import no.deichman.services.uridefaults.BaseURI;
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
import org.json.JSONObject;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.json.Json;
import javax.json.JsonArray;
import javax.json.JsonArrayBuilder;
import javax.json.JsonObjectBuilder;
import javax.ws.rs.core.Response.Status;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.List;

import static com.google.common.collect.ImmutableMap.of;
import static java.net.HttpURLConnection.HTTP_OK;
import static javax.json.Json.createObjectBuilder;
import static javax.ws.rs.core.Response.Status.BAD_REQUEST;
import static javax.ws.rs.core.Response.Status.CREATED;
import static javax.ws.rs.core.Response.Status.NOT_FOUND;
import static javax.ws.rs.core.Response.Status.NO_CONTENT;
import static junit.framework.TestCase.fail;
import static no.deichman.services.rdf.RDFModelUtil.modelFrom;
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
    private static final String EMPTY_STRING = "";
    private static final String ADD = "ADD";
    private static final String DEL = "DEL";
    public static final String ISBN = "978-82-525-8570-4";
    private static String appURI;
    private static App app;

    private static KohaSvcMock kohaSvcMock;
    private static EmbeddedElasticsearchServer embeddedElasticsearchServer;
    private static int appPort;
    private static Z3950ServiceMock z3950ServiceMock;

    private String resolveLocally(String uri) {
        return uri.replaceAll(BaseURI.root(), "");
    }

    @BeforeClass
    public static void setUp() throws Exception {
        appPort = PortSelector.randomFree();
        int jamonAppPort = PortSelector.randomFree();
        kohaSvcMock = new KohaSvcMock();
        String svcEndpoint = LOCALHOST + ":" + kohaSvcMock.getPort();
        z3950ServiceMock = new Z3950ServiceMock();
        String z3950Endpoint = LOCALHOST + ":" + z3950ServiceMock.getPort();
        System.setProperty("Z3950_ENDPOINT", z3950Endpoint);

        setupElasticSearch();
        System.setProperty("ELASTICSEARCH_URL", "http://localhost:" + embeddedElasticsearchServer.getPort());

        appURI = LOCALHOST + ":" + appPort + "/";
        app = new App(appPort, svcEndpoint, USE_IN_MEMORY_REPO, jamonAppPort, z3950Endpoint);
        app.startAsync();
    }

    private static void setupElasticSearch() throws Exception {
        embeddedElasticsearchServer = new EmbeddedElasticsearchServer();
        Unirest.post(appURI + "/search/clear_index");
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
                        .add("s", resource).add("p", BaseURI.ontology("contributor"))
                        .add("o", createObjectBuilder()
                                .add("value", "_:c1")
                                .add("type", ANY_URI)))
                .add(createObjectBuilder()
                        .add("op", "add")
                        .add("s", "_:c1")
                        .add("p", "http://www.w3.org/1999/02/22-rdf-syntax-ns#type")
                        .add("o", createObjectBuilder()
                                .add("value", BaseURI.ontology("Contribution"))
                                .add("type", ANY_URI)))
                .add(createObjectBuilder()
                        .add("op", "add").add("s", "_:c1")
                        .add("p", BaseURI.ontology("role"))
                        .add("o", createObjectBuilder()
                                .add("value", "http://data.deichman.no/role#author")
                                .add("type", ANY_URI)))
                .add(createObjectBuilder()
                        .add("op", "add").add("s", "_:c1")
                        .add("p", BaseURI.ontology("agent"))
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

    private static RequestBodyEntity buildPatchRequest(String id, JsonArray patch) {
        return Unirest
                .patch(appURI + id)
                .header("Accept", "application/ld+json")
                .header("Content-Type", "application/ldpatch+json")
                .body(new JsonNode(patch.toString()));
    }

    private static HttpResponse<String> buildReplaceRequest(XURI replacee, XURI replacement) throws UnsupportedEncodingException, UnirestException {
        return  Unirest
                .put(appURI + replacement.getType() + "/" + replacement.getId() + "/merge")
                .header("Content-type", "application/json")
                .body("{\"replacee\": \"" + replacee.getUri() + "\"}")
                .asString();
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
        return buildCreateRequest(appURI + entityType.getPath(), "{}").asString();
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


    @Test
    public void happy_day_scenario() throws Exception {

        kohaSvcMock.addLoginExpectation();
        kohaSvcMock.addCreateNewBiblioExpectation(FIRST_BIBLIO_ID);

        final HttpResponse<JsonNode> createPublicationResponse = buildEmptyCreateRequest(appURI + "publication").asJson();

        assertResponse(CREATED, createPublicationResponse);
        final String publicationUri = getLocation(createPublicationResponse);
        assertIsUri(publicationUri);
        assertThat(publicationUri, startsWith(BaseURI.publication()));

        final HttpResponse<JsonNode> createWorkResponse = buildEmptyCreateRequest(appURI + "work").asJson();

        assertResponse(CREATED, createWorkResponse);
        final String workUri = getLocation(createWorkResponse);
        assertIsUri(workUri);
        assertThat(workUri, startsWith(BaseURI.work()));

        final JsonArray addNameToWorkPatch = buildLDPatch(buildPatchStatement("add", workUri, BaseURI.ontology("mainTitle"), "Sult"));
        final HttpResponse<String> patchAddNameToWorkPatchResponse = buildPatchRequest(resolveLocally(workUri), addNameToWorkPatch).asString();
        assertResponse(Status.OK, patchAddNameToWorkPatchResponse);

        final JsonArray addYearToWorkPatch = buildLDPatch(buildPatchStatement("add", workUri, BaseURI.ontology("publicationYear"), "2015", "http://www.w3.org/2001/XMLSchema#gYear"));
        final HttpResponse<String> patchAddYearToWorkPatchResponse = buildPatchRequest(resolveLocally(workUri), addYearToWorkPatch).asString();
        assertResponse(Status.OK, patchAddYearToWorkPatchResponse);

        final HttpResponse<JsonNode> createPersonResponse = buildEmptyCreateRequest(appURI + "person").asJson();
        assertResponse(CREATED, createPersonResponse);
        final String personUri = getLocation(createPersonResponse);
        assertIsUri(personUri);
        assertThat(personUri, startsWith(BaseURI.person()));

        final JsonArray addCreatorNameToPersonPatch = buildLDPatch(buildPatchStatement("add", personUri, BaseURI.ontology("name"), "Knut Hamsun"));
        final HttpResponse<String> patchAddCreatornameToPersonPatchResponse = buildPatchRequest(resolveLocally(personUri), addCreatorNameToPersonPatch).asString();
        assertResponse(Status.OK, patchAddCreatornameToPersonPatchResponse);

        final JsonArray addBirthToPersonPatch = buildLDPatch(buildPatchStatement("add", personUri, BaseURI.ontology("birthYear"), "1923", "http://www.w3.org/2001/XMLSchema#gYear"));
        final HttpResponse<String> patchAddBirthToPersonPatchResponse = buildPatchRequest(resolveLocally(personUri), addBirthToPersonPatch).asString();
        assertResponse(Status.OK, patchAddBirthToPersonPatchResponse);

        final JsonArray addDeathToPersonPatch = buildLDPatch(buildPatchStatement("add", personUri, BaseURI.ontology("deathYear"), "2015", "http://www.w3.org/2001/XMLSchema#gYear"));
        final HttpResponse<String> patchAddDeathToPersonPatchResponse = buildPatchRequest(resolveLocally(personUri), addDeathToPersonPatch).asString();
        assertResponse(Status.OK, patchAddDeathToPersonPatchResponse);

        final JsonArray addCreatorToWorkPatch = buildContributorPatchStatement(workUri, personUri).build();
        final HttpResponse<String> patchAddCreatorToWorkPatchResponse = buildPatchRequest(resolveLocally(workUri), addCreatorToWorkPatch).asString();
        assertResponse(Status.OK, patchAddCreatorToWorkPatchResponse);

        final JsonArray workIntoPublicationPatch = buildLDPatch(buildPatchStatement("add", publicationUri, BaseURI.ontology("publicationOf"), workUri, ANY_URI));

        final HttpResponse<String> patchWorkIntoPublicationResponse = buildPatchRequest(resolveLocally(publicationUri), workIntoPublicationPatch).asString();
        assertResponse(Status.OK, patchWorkIntoPublicationResponse);

        final JsonArray isbnOfPublicationPatch = buildLDPatch(buildPatchStatement("add", publicationUri, BaseURI.ontology("isbn"), ISBN));

        final HttpResponse<String> patchIsbnIntoPublicationResponse = buildPatchRequest(resolveLocally(publicationUri), isbnOfPublicationPatch).asString();
        assertResponse(Status.OK, patchIsbnIntoPublicationResponse);

        final JsonArray mainTitleOfPublicationPatch = buildLDPatch(buildPatchStatement("add", publicationUri, BaseURI.ontology("mainTitle"), "pubMainTitle"));

        final HttpResponse<String> patchMainTitleIntoPublicationResponse = buildPatchRequest(resolveLocally(publicationUri), mainTitleOfPublicationPatch).asString();
        assertResponse(Status.OK, patchMainTitleIntoPublicationResponse);

        final HttpResponse<JsonNode> getPublicationProjectionResponse = buildGetRequest(resolveLocally("/publication")).queryString(of("isbn", ISBN, "@return", "mainTitle")).asJson();
        assertResponse(Status.OK, getPublicationProjectionResponse);
        assertTrue(getPublicationProjectionResponse.getBody().toString().contains("pubMainTitle"));

        kohaSvcMock.addCreateNewBiblioExpectation(SECOND_BIBLIO_ID);

        final HttpResponse<JsonNode> createSecondPublicationResponse = buildEmptyCreateRequest(appURI + "publication").asJson();
        assertResponse(CREATED, createSecondPublicationResponse);
        final String secondPublicationUri = getLocation(createSecondPublicationResponse);

        final JsonArray workIntoSecondPublicationPatch = buildLDPatch(buildPatchStatement("add", secondPublicationUri, BaseURI.ontology("publicationOf"), workUri, ANY_URI));
        final HttpResponse<String> patchWorkIntoSecondPublicationResponse = buildPatchRequest(resolveLocally(secondPublicationUri), workIntoSecondPublicationPatch).asString();
        assertResponse(Status.OK, patchWorkIntoSecondPublicationResponse);

        final HttpResponse<JsonNode> getWorkWithTwoPublications = buildGetRequest(resolveLocally(workUri)).asJson();

        assertResponse(Status.OK, getWorkWithTwoPublications);
        final JsonNode workWith2Publications = getWorkWithTwoPublications.getBody();
        assertThat(workWith2Publications, notNullValue());

        final Model workWith2PublicationsModel = modelFrom(workWith2Publications.toString(), Lang.JSONLD);

        final QueryExecution workWith2PublicationsCount = QueryExecutionFactory.create(
                QueryFactory.create(
                        "PREFIX deichman: <" + BaseURI.ontology() + ">"
                                + "SELECT (COUNT (?publication) AS ?noOfPublications) { "
                                + "<" + workUri + "> a deichman:Work ."
                                + "?publication a deichman:Publication ."
                                + "?publication deichman:publicationOf <" + workUri + "> ."
                                + "}"), workWith2PublicationsModel);
        assertThat("model does not have a work with two publications",
                workWith2PublicationsCount.execSelect().next().getLiteral("noOfPublications").getInt(),
                equalTo(2));

        //Change the work title and search for it again.
        final JsonArray delTitleToWorkPatch = buildLDPatch(buildPatchStatement("del", workUri, BaseURI.ontology("mainTitle"), "Sult"));
        final HttpResponse<String> patchDelTitleToWorkPatchResponse = buildPatchRequest(resolveLocally(workUri), delTitleToWorkPatch).asString();
        assertResponse(Status.OK, patchDelTitleToWorkPatchResponse);
        final JsonArray addNewTitleToWorkPatch = buildLDPatch(buildPatchStatement("add", workUri, BaseURI.ontology("mainTitle"), "Metthet"));
        final HttpResponse<String> patchAddNewTitleToWorkPatchResponse = buildPatchRequest(resolveLocally(workUri), addNewTitleToWorkPatch).asString();
        assertResponse(Status.OK, patchAddNewTitleToWorkPatchResponse);
        doSearchForWorks("Metthet");

        //Change the person name and search for it again.
        final JsonArray delCreatorNameToPersonPatch = buildLDPatch(buildPatchStatement("del", personUri, BaseURI.ontology("name"), "Knut Hamsun"));
        final HttpResponse<String> patchDelCreatorNameToPersonPatchResponse = buildPatchRequest(resolveLocally(personUri), delCreatorNameToPersonPatch).asString();
        assertResponse(Status.OK, patchDelCreatorNameToPersonPatchResponse);
        final JsonArray addNewCreatorNameToPersonPatch = buildLDPatch(buildPatchStatement("add", personUri, BaseURI.ontology("name"), "Orwell, George"));
        final HttpResponse<String> patchAddNewCreatorNameToPersonPatchResponse = buildPatchRequest(resolveLocally(personUri), addNewCreatorNameToPersonPatch).asString();
        assertResponse(Status.OK, patchAddNewCreatorNameToPersonPatchResponse);
        doSearchForPersons("Orwell, George");

        doSearchForPublicationByRecordId(FIRST_BIBLIO_ID);

        
        // delete publication
        kohaSvcMock.addGetBiblioExpandedExpectation(FIRST_BIBLIO_ID, "{\"items\":[]}");
        kohaSvcMock.addDeleteBibloExpectation(FIRST_BIBLIO_ID);
        assertEquals(Status.NO_CONTENT.getStatusCode(), buildDeleteRequest(resolveLocally(publicationUri)).getStatus());

        // delete work
        assertEquals(Status.NO_CONTENT.getStatusCode(), buildDeleteRequest(resolveLocally(workUri)).getStatus());
    }

    @Test
    public void person_resource_can_be_created_if_not_a_duplicate() throws UnirestException {
        String input = "<__BASEURI__externalPerson/p1234> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <__BASEURI__ontology#Person> .\n"
                + "<__BASEURI__externalPerson/p1234> <__BASEURI__ontology#name> \"Kim Kimsen\"^^<http://www.w3.org/1999/02/22-rdf-syntax-ns#plainLiteral> .\n"
                + "<__BASEURI__externalPerson/p1234> <http://data.deichman.no/duo#bibliofilPersonId> \"1234\" .\n"
                + "<__BASEURI__externalPerson/p1234> <__BASEURI__ontology#birthYear> \"1988\"^^<http://www.w3.org/2001/XMLSchema#gYear> .\n";

        input = input.replace("__BASEURI__", appURI);

        String duplicateInput = "<__BASEURI__externalPerson/p1234> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <__BASEURI__ontology#Person> .\n"
                + "<__BASEURI__externalPerson/p1234> <__BASEURI__ontology#name> \"Kim Kimsen\"^^<http://www.w3.org/1999/02/22-rdf-syntax-ns#plainLiteral> .\n"
                + "<__BASEURI__externalPerson/p1234> <http://data.deichman.no/duo#bibliofilPersonId> \"1234\" .\n"
                + "<__BASEURI__externalPerson/p1234> <__BASEURI__ontology#birthYear> \"1988\"^^<http://www.w3.org/2001/XMLSchema#gYear> .\n";
        duplicateInput = duplicateInput.replace("__BASEURI__", appURI);

        Model testModel = modelFrom(input, Lang.NTRIPLES);
        String body = RDFModelUtil.stringFrom(testModel, Lang.JSONLD);

        Model testModel2 = modelFrom(duplicateInput, Lang.NTRIPLES);
        String body2 = RDFModelUtil.stringFrom(testModel2, Lang.JSONLD);

        HttpResponse<String> result1 = buildCreateRequest(appURI + "person", body).asString();
        HttpResponse<String> result2 = buildCreateRequest(appURI + "person", body2).asString();

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

        input = input.replace("__BASEURI__", appURI);

        String duplicateInput = "<__BASEURI__externalPlace/g1234> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <__BASEURI__ontology#Place> .\n"
                + "<__BASEURI__externalPlace/g1234> <__BASEURI__ontology#prefLabel> \"Oslo\"^^<http://www.w3.org/1999/02/22-rdf-syntax-ns#plainLiteral> .\n"
                + "<__BASEURI__externalPlace/g1234> <http://data.deichman.no/duo#bibliofilPlaceId> \"1234\" .\n"
                + "<__BASEURI__externalPlace/g1234> <__BASEURI__ontology#specification> \"Norge\"^^<http://www.w3.org/1999/02/22-rdf-syntax-ns#plainLiteral> .\n";
        duplicateInput = duplicateInput.replace("__BASEURI__", appURI);

        Model testModel = modelFrom(input, Lang.NTRIPLES);
        String body = RDFModelUtil.stringFrom(testModel, Lang.JSONLD);

        Model testModel2 = modelFrom(duplicateInput, Lang.NTRIPLES);
        String body2 = RDFModelUtil.stringFrom(testModel2, Lang.JSONLD);

        HttpResponse<String> result1 = buildCreateRequest(appURI + "place", body).asString();
        HttpResponse<String> result2 = buildCreateRequest(appURI + "place", body2).asString();

        assertResponse(Status.CONFLICT, result2);
        String location1 = getLocation(result1);
        String location2 = getLocation(result2);
        assertTrue(location1.equals(location2));
    }

    @Test
    public void place_is_patched() throws UnirestException {
        HttpResponse<String> result1 = buildCreateRequest(appURI + "place", "{}").asString();
        String op = "ADD";
        String s = getLocation(result1);
        String p = BaseURI.ontology("prefLabel");
        String o = "Oslo";
        String type = "http://www.w3.org/2001/XMLSchema#string";
        JsonArray body = buildLDPatch(buildPatchStatement(op, s, p, o, type));
        HttpResponse<String> result2 = buildPatchRequest(resolveLocally(s), body).asString();
        assertEquals(Status.OK.getStatusCode(), result2.getStatus());
    }


    @Test
    public void place_is_deleted() throws UnirestException {
        HttpResponse<String> result1 = buildCreateRequest(appURI + "place", "{}").asString();
        HttpResponse<String> result2 = buildDeleteRequest(resolveLocally(getLocation(result1)));
        assertEquals(Status.NO_CONTENT.getStatusCode(), result2.getStatus());
    }

    @Test
    public void place_is_searchable() throws UnirestException, InterruptedException {
        HttpResponse<String> result1 = buildCreateRequest(appURI + "place", "{}").asString();

        String op = "ADD";
        String s = getLocation(result1);
        String p1 = BaseURI.ontology("prefLabel");
        String o1 = "Oslo";
        String type = "http://www.w3.org/2001/XMLSchema#string";
        String p2 = BaseURI.ontology("specification");
        String o2 = "Norway";

        JsonArray body = Json.createArrayBuilder()
                .add(buildLDPatch(buildPatchStatement(op, s, p1, o1, type)).get(0))
                .add(buildLDPatch(buildPatchStatement(op, s, p2, o2, type)).get(0))
                .build();

        HttpResponse<String> result2 = buildPatchRequest(resolveLocally(s), body).asString();
        assertEquals(Status.OK.getStatusCode(), result2.getStatus());
        doSearchForPlace("Oslo");
    }

    @Test
    public void compositiontype_is_searchable() throws UnirestException, InterruptedException {
        HttpResponse<String> result1 = buildCreateRequest(appURI + "compositionType", "{}").asString();

        String op = "ADD";
        String s = getLocation(result1);
        String p1 = BaseURI.ontology("prefLabel");
        String o1 = "Menuette";
        String type = "http://www.w3.org/2001/XMLSchema#string";
        String p2 = BaseURI.ontology("ontology#specification");
        String o2 = "Posh dance";

        JsonArray body = Json.createArrayBuilder()
                .add(buildLDPatch(buildPatchStatement(op, s, p1, o1, type)).get(0))
                .add(buildLDPatch(buildPatchStatement(op, s, p2, o2, type)).get(0))
                .build();

        HttpResponse<String> result2 = buildPatchRequest(resolveLocally(s), body).asString();
        assertEquals(Status.OK.getStatusCode(), result2.getStatus());
        doSearchForCompositionType("Menuette");
    }

    @Test
    public void serial_is_searchable() throws UnirestException, InterruptedException {
        HttpResponse<String> result1 = buildCreateRequest(appURI + "serial", "{}").asString();

        String op = "ADD";
        String s = getLocation(result1);
        String p1 = BaseURI.ontology("mainTitle");
        String o1 = "Morgan Kane";
        String type = "http://www.w3.org/2001/XMLSchema#string";

        JsonArray body = Json.createArrayBuilder()
                .add(buildLDPatch(buildPatchStatement(op, s, p1, o1, type)).get(0))
                .build();

        HttpResponse<String> result2 = buildPatchRequest(resolveLocally(s), body).asString();
        assertEquals(Status.OK.getStatusCode(), result2.getStatus());
        doSearchForSerial("Morgan Kane");
    }

    @Test
    public void work_series_is_searchable() throws UnirestException, InterruptedException {
        HttpResponse<String> result1 = buildCreateRequest(appURI + "workSeries", "{}").asString();

        String op = "ADD";
        String s = getLocation(result1);
        String p1 = BaseURI.ontology("mainTitle");
        String o1 = "Sagaen om Isfolket";
        String type = "http://www.w3.org/2001/XMLSchema#string";

        JsonArray body = Json.createArrayBuilder()
                .add(buildLDPatch(buildPatchStatement(op, s, p1, o1, type)).get(0))
                .build();

        HttpResponse<String> result2 = buildPatchRequest(resolveLocally(s), body).asString();
        assertEquals(Status.OK.getStatusCode(), result2.getStatus());
        doSearchForWorkSeries("Sagaen om Isfolket");
    }

    @Test
    public void subject_is_searchable() throws UnirestException, InterruptedException {
        HttpResponse<String> result1 = buildCreateRequest(appURI + "subject", "{}").asString();

        String op = "ADD";
        String s = getLocation(result1);
        String p1 = BaseURI.ontology("prefLabel");
        String o1 = "Knitting";
        String type = "http://www.w3.org/2001/XMLSchema#string";

        JsonArray body = Json.createArrayBuilder()
                .add(buildLDPatch(buildPatchStatement(op, s, p1, o1, type)).get(0))
                .build();

        HttpResponse<String> result2 = buildPatchRequest(resolveLocally(s), body).asString();
        assertEquals(Status.OK.getStatusCode(), result2.getStatus());
        doSearchForSubject("Knitting");
    }

    @Test
    public void genre_is_searchable() throws UnirestException, InterruptedException {
        HttpResponse<String> result1 = buildCreateRequest(appURI + "genre", "{}").asString();

        String op = "ADD";
        String s = getLocation(result1);
        String p1 = BaseURI.ontology("prefLabel");
        String o1 = "Romance";
        String type = "http://www.w3.org/2001/XMLSchema#string";

        JsonArray body = Json.createArrayBuilder()
                .add(buildLDPatch(buildPatchStatement(op, s, p1, o1, type)).get(0))
                .build();

        HttpResponse<String> result2 = buildPatchRequest(resolveLocally(s), body).asString();
        assertEquals(Status.OK.getStatusCode(), result2.getStatus());
        doSearchForGenre("Romance");
    }

    @Test
    public void event_is_searchable() throws UnirestException, InterruptedException {
        HttpResponse<String> result1 = buildCreateRequest(appURI + "event", "{}").asString();

        String op = "ADD";
        String s = getLocation(result1);
        String p1 = BaseURI.ontology("prefLabel");
        String o1 = "Menuette";
        String type = "http://www.w3.org/2001/XMLSchema#string";
        String p2 = BaseURI.ontology("specification");
        String o2 = "Posh dance";

        JsonArray body = Json.createArrayBuilder()
                .add(buildLDPatch(buildPatchStatement(op, s, p1, o1, type)).get(0))
                .add(buildLDPatch(buildPatchStatement(op, s, p2, o2, type)).get(0))
                .build();

        HttpResponse<String> result2 = buildPatchRequest(resolveLocally(s), body).asString();
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
            HttpResponse<String> addResult = buildPatchRequest(resolveLocally(location.getUri()), createSimplePatch(ADD, location)).asString();
            assertEquals("expected OK when creating " + entityType + " but got " + addResult.getStatus(), Status.OK.getStatusCode(), addResult.getStatus());
            checkTimestampPresent(location.getUri(), "modified");
            HttpResponse<String> delResult = buildPatchRequest(resolveLocally(location.getUri()), createSimplePatch(DEL, location)).asString();
            assertEquals(Status.OK.getStatusCode(), delResult.getStatus());
        }
    }

    private JsonArray createSimplePatch(String operation, XURI xuri) throws Exception {
        if (!operation.matches("ADD|DEL")) {
            throw new Exception("You did not specify a valid patch operation (ADD|DEL)");
        }

        String s = xuri.getUri();
        String p1 = BaseURI.ontology("prefLabel");
        String o1 = "TestTestTest";
        String type = "http://www.w3.org/2001/XMLSchema#string";

        return Json.createArrayBuilder()
                .add(buildLDPatch(buildPatchStatement(operation, s, p1, o1, type)).get(0))
                .build();
    }

    @Test
    public void test_resource_can_be_created() throws Exception {
        for (EntityType entityType : EntityType.values()) {
            if (entityType.equals(EntityType.PUBLICATION)) {
                setUpKohaExpectation(SECOND_BIBLIO_ID);
            }

            System.out.println("Testing resource creation for " + entityType.name());
            HttpResponse<String> result = createEmptyResource(entityType);
            assertEquals(Status.CREATED.getStatusCode(), result.getStatus());
            assertEquals(EMPTY_STRING, result.getBody());
            checkTimestampPresent(getLocation(result), "created");
        }
    }

    private void checkTimestampPresent(String locationUri, final String fragment) throws Exception {
        HttpResponse<JsonNode> jsonNodeHttpResponse = buildGetRequest(resolveLocally(locationUri)).asJson();
        try {
            Object createdObject = jsonNodeHttpResponse.getBody().getObject().get("deichman:" + fragment);
            String createdDateTime = ((JSONObject) createdObject).get("@value").toString();
            assertTrue("Missing deichman:" + fragment + " for " + new XURI(locationUri).getType(), createdDateTime.endsWith("Z"));
        } catch (Exception e) {
            fail(e.getMessage() + " Couldn't get " + fragment + " timestamp for " + new XURI(locationUri).getType());
        }
    }

    @Test
    public void test_patching_with_bnodes() throws UnirestException {
        HttpResponse<String> result1 = buildCreateRequest(appURI + "place", "{}").asString();
        String op = "ADD";
        String s = getLocation(result1);
        String p1 = BaseURI.ontology("place");
        String o1 = "_:b0";
        String type = ANY_URI;
        String p2 = BaseURI.ontology("prefLabel");
        String o2 = "Norway";

        JsonArray body = Json.createArrayBuilder()
                .add(buildLDPatch(buildPatchStatement(op, s, p1, o1, type)).get(0))
                .add(buildLDPatch(buildPatchStatement(op, o1, p2, o2)).get(0))
                .build();
        HttpResponse<String> result2 = buildPatchRequest(resolveLocally(s), body).asString();

        assertEquals(Status.OK.getStatusCode(), result2.getStatus());
    }

    @Test
    public void test_deletion_of_bnodes() throws UnirestException {
        HttpResponse<String> result1 = buildCreateRequest(appURI + "place", "{}").asString();
        String op = ADD;
        String s = getLocation(result1);
        String p1 = BaseURI.ontology("PLACE");
        String o1 = "_:b0";
        String type = ANY_URI;
        String p2 = BaseURI.ontology("prefLabel");
        String o2 = "Norway";

        JsonArray addBody = Json.createArrayBuilder()
                .add(buildLDPatch(buildPatchStatement(op, s, p1, o1, type)).get(0))
                .add(buildLDPatch(buildPatchStatement(op, o1, p2, o2)).get(0))
                .build();
        HttpResponse<String> result2 = buildPatchRequest(resolveLocally(s), addBody).asString();

        assertEquals(Status.OK.getStatusCode(), result2.getStatus());

        JsonArray delBody = Json.createArrayBuilder()
                .add(buildLDPatch(buildPatchStatement(DEL, s, p1, o1, type)).get(0))
                .add(buildLDPatch(buildPatchStatement(DEL, o1, p2, o2)).get(0))
                .build();
        HttpResponse<String> result3 = buildPatchRequest(resolveLocally(s), delBody).asString();

        assertEquals(Status.OK.getStatusCode(), result3.getStatus());
    }

    private HttpResponse<String> buildDeleteRequest(String location) throws UnirestException {
        return Unirest
                .delete(appURI + location).asString();
    }

    @Test
    public void serial_resource_can_be_created() throws UnirestException {
        String input = "<http://data.deichman.no/serial/s1234> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://data.deichman.no/ontology#Serial> .\n"
                + "<http://data.deichman.no/serial/s1234> <http://data.deichman.no/ontology#name> \"Serial name\" .\n";

        Model testModel = modelFrom(input, Lang.NTRIPLES);
        String body = RDFModelUtil.stringFrom(testModel, Lang.JSONLD);

        HttpResponse<String> result = buildCreateRequest(appURI + "serial", body).asString();

        assertResponse(CREATED, result);
    }

    @Test
    public void corporation_is_patched() throws UnirestException {
        HttpResponse<String> result1 = buildCreateRequest(appURI + "corporation", "{}").asString();
        String op = "ADD";
        String s = getLocation(result1);
        String p = BaseURI.ontology("name");
        String o = "Acme Publishing Norway";
        String type = "http://www.w3.org/2001/XMLSchema#string";
        JsonArray body = buildLDPatch(buildPatchStatement(op, s, p, o, type));
        HttpResponse<String> result2 = buildPatchRequest(resolveLocally(s), body).asString();
        assertEquals(Status.OK.getStatusCode(), result2.getStatus());
    }

    @Test
    public void place_of_corporation_is_deleted() throws UnirestException {
        HttpResponse<String> result1 = buildCreateRequest(appURI + "corporation", "{}").asString();
        HttpResponse<String> result2 = buildDeleteRequest(resolveLocally(getLocation(result1)));
        assertEquals(Status.NO_CONTENT.getStatusCode(), result2.getStatus());
    }

    @Test
    public void get_authorized_values() throws Exception {

        for (AuthorizedValue authorizedValue : AuthorizedValue.values()) {
            HttpRequest authorizedValueRequest = Unirest
                    .get(appURI + "authorized_values/" + authorizedValue.getPath())
                    .header("Accept", LD_JSON);
            HttpResponse<?> authorizedValueResponse = authorizedValueRequest.asString();
            System.out.println("Testing authorized value: " + authorizedValue.getPath());
            assertResponse(Status.OK, authorizedValueResponse);
            Model test = modelFrom(authorizedValueResponse.getBody().toString(), Lang.JSONLD);
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
                testData = "<http://data.deichman.no/literaryForm#poetry> <http://www.w3.org/2000/01/rdf-schema#label> \"Poem\"@en .";
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
            case FICTION_NONFICTION:
                testData = "<http://data.deichman.no/fictionNonfiction#nonfiction> <http://www.w3.org/2000/01/rdf-schema#label> \"Fag\"@no .";
                break;
            default:
                throw new Exception("Couldn't find test data for authorized value: " + authorizedValue.getPath());
        }
        return modelFrom(testData, Lang.NTRIPLES);
    }

    @Test
    public void get_ontology() throws Exception {
        HttpRequest request = Unirest
                .get(appURI + "ontology")
                .header("Accept", LD_JSON);
        HttpResponse<?> response = request.asString();
        assertResponse(Status.OK, response);

        Model ontology = modelFrom(response.getBody().toString(), Lang.JSONLD);
        Statement workStatement = createStatement(
                createResource(BaseURI.ontology("Work")),
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
                    .get(appURI + "search/work/_search").queryString("q", "mainTitle=" + name);
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
                    .get(appURI + "search/person/_search").queryString("q", "name:" + name);
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
            HttpRequest request = Unirest.get(appURI + "search/place/_search").queryString("q", "prefLabel:" + place);
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
            HttpRequest request = Unirest.get(appURI + "search/compositionType/_search").queryString("q", "prefLabel:" + compositionType);
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
            HttpRequest request = Unirest.get(appURI + "search/serial/_search").queryString("q", "mainTitle:" + name);
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

    private void doSearchForWorkSeries(String mainTitle) throws UnirestException, InterruptedException {
        boolean foundWorkSeries;
        int attempts = TEN_TIMES;
        do {
            HttpRequest request = Unirest.get(appURI + "search/workSeries/_search").queryString("q", "mainTitle:" + mainTitle);
            HttpResponse<?> response = request.asJson();
            String responseBody = response.getBody().toString();
            foundWorkSeries = responseBody.contains(mainTitle);
            if (!foundWorkSeries) {
                LOG.info("WorkSeries not found in index yet, waiting one second");
                Thread.sleep(ONE_SECOND);
            }
        } while (!foundWorkSeries && attempts-- > 0);

        assertTrue("Should have found mainTitle of workSeries in index by now", foundWorkSeries);
    }

    private void doSearchForPublicationByRecordId(String recordId) throws UnirestException, InterruptedException {
        boolean foundPublication;
        int attempts = TEN_TIMES;
        do {
            HttpRequest request = Unirest.get(appURI + "search/publication/_search").queryString("q", "recordId:" + recordId);
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
            HttpRequest request = Unirest.get(appURI + "search/subject/_search").queryString("q", "prefLabel:" + name);
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
            HttpRequest request = Unirest.get(appURI + "search/genre/_search").queryString("q", "prefLabel:" + name);
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
            HttpRequest request = Unirest.get(appURI + "search/event/_search").queryString("q", "prefLabel:" + event);
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
        String source = ""
                + "{ "
                + "    \"mainTitle\": \"" + title + "\","
                + "    \"publicationYear\": \"1890\","
                + "    \"uri\": \"http://deichman.no/work/w12344553\","
                + "    \"contributors\": [{ \"role\": \"http://data.deichman.no/role#author\", \"agent\":{"
                + "       \"name\": \"Knut Hamsun\","
                + "       \"birthYear\": \"1859\","
                + "       \"deathYear\": \"1952\","
                + "       \"uri\": \"http://deichman.no/person/h12345\"}"
                + "    }]"
                + "}";
        embeddedElasticsearchServer.getClient().index("search", "work", source);
     }

    @Test
    public void when_get_elasticsearch_work_without_query_parameter_should_get_bad_request_response() throws Exception {
        HttpRequest request = Unirest
                .get(appURI + "search/work/_search");
        HttpResponse<?> response = request.asString();
        assertResponse(Status.BAD_REQUEST, response);
    }

    private GetRequest buildGetItemsRequest(String workUri) {
        return Unirest
                .get(appURI + workUri + "/items")
                .header("Accept", "application/ld+json");
    }

    private GetRequest buildGetRequest(String workUri) {
        return Unirest
                .get(appURI + workUri)
                .header("Accept", "application/ld+json");
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

        setupExpectationForMarcXmlSentToKoha(creator, publicationTitle, partTitle, partNumber, isbn, publicationYear);
        kohaSvcMock.addLoginExpectation();

        String personUri = createPersonInRdfStore(creator, BaseURI.ontology());
        String workUri = createWorkInRdfStore(workTitle, BaseURI.ontology(), personUri);

        String publicationTriples = ""
                + "<http://data.deichman.no/publication/p1> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <" + BaseURI.ontology("Publication") + "> .\n"
                + "<http://data.deichman.no/publication/p1> <" + BaseURI.ontology("mainTitle") + "> \"" + publicationTitle + "\" .\n"
                + "<http://data.deichman.no/publication/p1> <" + BaseURI.ontology("partTitle") + "> \"" + partTitle + "\" .\n"
                + "<http://data.deichman.no/publication/p1> <" + BaseURI.ontology("publicationOf") + "> <__WORKURI__> .\n"
                + "<http://data.deichman.no/publication/p1> <" + BaseURI.ontology("partNumber") + "> \"" + partNumber + "\" .\n"
                + "<http://data.deichman.no/publication/p1> <" + BaseURI.ontology("isbn") + "> \"" + isbn + "\" .\n"
                + "<http://data.deichman.no/publication/p1> <" + BaseURI.ontology("publicationYear") + "> \"" + publicationYear + "\" .\n";

        HttpResponse<JsonNode> createpublicationResponse = buildCreateRequestNtriples(appURI + "publication", publicationTriples.replace("__WORKURI__", workUri)).asJson();
        assertNotNull(getLocation(createpublicationResponse));
    }

    private String createWorkInRdfStore(String workTitle, String ontologyURI, String personUri) throws UnirestException {
        String workTriples = ""
                + "<http://data.deichman.no/work/w1> <" + ontologyURI + "mainTitle> \"" + workTitle + "\" .\n"
                + "<http://data.deichman.no/work/w1> <" + ontologyURI + "publicationYear> \"2011\"^^<http://www.w3.org/2001/XMLSchema#gYear> ."
                + "<http://data.deichman.no/work/w1> <" + ontologyURI + "contributor> _:b1 .\n"
                + "_:b1 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <" + ontologyURI + "Contribution> .\n"
                + "_:b1 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <" + ontologyURI + "MainEntry> .\n"
                + "_:b1  <" + ontologyURI + "role> <http://data.deichman.no/role#author> .\n"
                + "_:b1  <" + ontologyURI + "agent> <__CREATORURI__> .\n";
        HttpResponse<JsonNode> createworkResponse = buildCreateRequestNtriples(appURI + "work", workTriples.replace("__CREATORURI__", personUri)).asJson();
        return getLocation(createworkResponse);
    }

    private String createPersonInRdfStore(String person, String ontologyURI) throws UnirestException {
        String personTriples = ""
                + "<http://data.deichman.no/person/h1> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <" + ontologyURI + "Person> .\n"
                + "<http://data.deichman.no/person/h1> <" + ontologyURI + "name> \"" + person + "\" .";
        HttpResponse<JsonNode> createPersonResponse = buildCreateRequestNtriples(appURI + "person", personTriples).asJson();
        return getLocation(createPersonResponse);
    }

    private String createSubjectInRdfStore(String subject, String ontologyURI) throws UnirestException {
        String subjectTriples = ""
                + "<http://data.deichman.no/subject/s1> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <" + ontologyURI + "Subject> .\n"
                + "<http://data.deichman.no/subject/s1> <" + ontologyURI + "prefLabel> \"" + subject + "\" .";
        HttpResponse<JsonNode> createSubjectResponse = buildCreateRequestNtriples(appURI + "subject", subjectTriples).asJson();
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

        HttpResponse<String> response = buildEmptyCreateRequest(appURI + "publication").asString();
        String location = getLocation(response);

        final HttpResponse<JsonNode> getPublication = buildGetRequest(resolveLocally(location)).asJson();

        Model model = modelFrom(getPublication.getBody().toString(), Lang.JSONLD);
        final String[] recordId = new String[1];
        model.listObjectsOfProperty(createProperty(BaseURI.ontology("recordId"))).forEachRemaining(s -> recordId[0] = s.asLiteral().toString());

        kohaSvcMock.addGetBiblioExpectation(recordId[0], resp);
        HttpResponse<String> result = Unirest.get(appURI + "marc/" + recordId[0]).asString();
        assertEquals(expected, result.getBody());
    }

    @Test
    public void when_index_is_cleared_search_returns_nothing() throws Exception {
        indexWork("101", "Lord of the rings");
        doSearchForWorks("Lord");
        HttpResponse<String> response = Unirest.post(appURI + "search/clear_index").asString();
        assertEquals(HTTP_OK, response.getStatus());
        doSearchForWorks("Lord", SHOULD_NOT_FIND);
        indexWork("102", "Lucky Luke");
        doSearchForWorks("Lucky");
    }

    @Test
    public void when_index_is_cleared_and_reindexed_works_are_found() throws Exception {
        indexWork("101", "Lord of the rings");
        doSearchForWorks("Lord");
        HttpResponse<String> response = Unirest.post(appURI + "search/clear_index").asString();
        assertEquals(HTTP_OK, response.getStatus());
        doSearchForWorks("Lord", SHOULD_NOT_FIND);

        String personUri = createPersonInRdfStore("Morris", BaseURI.ontology());
        createWorkInRdfStore("Lucky Luke", BaseURI.ontology(), personUri);
        Unirest.post(appURI + "search/work/reindex_all").asString();
        doSearchForWorks("Lucky");
    }

    @Test
    public void when_index_is_cleared_and_reindexed_subjects_are_found() throws Exception {
        createSubjectInRdfStore("Hekling", BaseURI.ontology());
        HttpResponse<String> response = Unirest.post(appURI + "search/clear_index").asString();
        assertEquals(HTTP_OK, response.getStatus());
        Unirest.post(appURI + "search/subject/reindex_all").asString();
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

        kohaSvcMock.addLoginExpectation();
        setupExpectationForMarcXmlSentToKoha(creator, publicationTitle, partTitle, partNumber, isbn, publicationYear);

        String personUri = createPersonInRdfStore(creator, BaseURI.ontology());
        String workUri = createWorkInRdfStore(workTitle, BaseURI.ontology(), personUri);
        String publicationTriples = ""
                + "<http://data.deichman.no/publication/p1> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <" + BaseURI.ontology("Publication") + "> .\n"
                + "<http://data.deichman.no/publication/p1> <" + BaseURI.ontology("mainTitle") + "> \"" + publicationTitle + "\" .\n"
                + "<http://data.deichman.no/publication/p1> <" + BaseURI.ontology("partTitle") + "> \"" + partTitle + "\" .\n"
                + "<http://data.deichman.no/publication/p1> <" + BaseURI.ontology("publicationOf") + "> <" + workUri + "> .\n"
                + "<http://data.deichman.no/publication/p1> <" + BaseURI.ontology("partNumber") + "> \"" + partNumber + "\" .\n"
                + "<http://data.deichman.no/publication/p1> <" + BaseURI.ontology("isbn") + "> \"" + isbn + "\" .\n"
                + "<http://data.deichman.no/publication/p1> <" + BaseURI.ontology("hasHoldingBranch") + "> \"hutl\" .\n"
                + "<http://data.deichman.no/publication/p1> <" + BaseURI.ontology("publicationYear") + "> \"" + publicationYear + "\" .\n";

        HttpResponse<JsonNode> createPublicationResponse = buildCreateRequestNtriples(appURI + "publication", publicationTriples).asJson();
        assertResponse(CREATED, createPublicationResponse);

        HttpResponse<String> stringHttpResponse = Unirest.put(appURI + resolveLocally(workUri) + "/index").asString();
        assertNotNull(stringHttpResponse);

    }

    @Test
    public void resources_are_reindexed_when_themself_or_connected_resources_are_changed() throws Exception {
        kohaSvcMock.addLoginExpectation(); // TODO understand why needed here

        InMemoryRepository repo = ResourceBase.getInMemoryRepository();
        String data = new ResourceReader().readFile("searchsynctestdata.ttl").replaceAll("__PORT__", String.valueOf(appPort));
        repo.createResource(modelFrom(data, Lang.TTL));

        String workUri = "http://data.deichman.no/work/w4e5db3a95caa282e5968f68866774e20";
        String pubUri1 = "http://data.deichman.no/publication/p594502562255";
        String pubUri2 = "http://data.deichman.no/publication/p735933031021";
        String persUri1 = "http://data.deichman.no/person/h10834700";
        String persUri2 = "http://data.deichman.no/person/h11234";
        String subjUri = "http://data.deichman.no/subject/e1200005";
        String workSeriesUri = "http://data.deichman.no/workSeries/v279125243466";

        // 1 ) Verify that resources exist in triplestore:

        assertTrue(repo.askIfResourceExists(new XURI(workUri)));
        assertTrue(repo.askIfResourceExists(new XURI(pubUri1)));
        assertTrue(repo.askIfResourceExists(new XURI(pubUri2)));
        assertTrue(repo.askIfResourceExists(new XURI(persUri1)));
        assertTrue(repo.askIfResourceExists(new XURI(persUri2)));
        assertTrue(repo.askIfResourceExists(new XURI(subjUri)));
        assertTrue(repo.askIfResourceExists(new XURI(workSeriesUri)));

        // 2) Verify that none of the resources are indexed:

        assertFalse(resourceIsIndexed(workUri));
        assertFalse(resourceIsIndexed(pubUri1));
        assertFalse(resourceIsIndexed(pubUri2));
        assertFalse(resourceIsIndexed(persUri1));
        assertFalse(resourceIsIndexed(persUri2));
        assertFalse(resourceIsIndexed(subjUri));

        // 3) Patch work, and verify that work, its mainentry agent and its publications gets indexed within 2 seconds:

        buildPatchRequest(
                resolveLocally(workUri),
                buildLDPatch(
                        buildPatchStatement("add", workUri, BaseURI.ontology("partTitle"), "æøå"))).asString();

        assertTrue(resourceIsIndexedWithinNumSeconds(workUri, 2));
        assertTrue(resourceIsIndexedWithinNumSeconds(pubUri1, 2));
        assertTrue(resourceIsIndexedWithinNumSeconds(pubUri2, 2));
        assertTrue(resourceIsIndexedWithinNumSeconds(persUri1, 2));

        // 4) Patch person, and verify that persn, work and publications gets reindexed within few seconds
        buildPatchRequest(
                resolveLocally(persUri1),
                buildLDPatch(
                        buildPatchStatement("del", persUri1, BaseURI.ontology("name"), "Ragde, Anne B."),
                        buildPatchStatement("add", persUri1, BaseURI.ontology("name"), "Zappa, Frank"))).asString();

        assertTrue(resourceIsIndexedWithValueWithinNumSeconds(persUri1, "Zappa, Frank", 2));
        assertTrue(resourceIsIndexedWithValueWithinNumSeconds(workUri, "Zappa, Frank", 2));
        assertTrue(resourceIsIndexedWithValueWithinNumSeconds(pubUri1, "Zappa, Frank", 2));
        assertTrue(resourceIsIndexedWithValueWithinNumSeconds(pubUri2, "Zappa, Frank", 2));


        // 5) Patch subject, and verify that publications get reindexed
        buildPatchRequest(
                resolveLocally(subjUri),
                buildLDPatch(
                        buildPatchStatement("del", subjUri, BaseURI.ontology("prefLabel"), "Trondheim"),
                        buildPatchStatement("add", subjUri, BaseURI.ontology("prefLabel"), "Drontheim"))).asString();

        //assertTrue(resourceIsIndexedWithValueWithinNumSeconds(workUri, "Drontheim", 2)); // TODO Ask kristoffer: framing/Query only includes uri in work
        assertTrue(resourceIsIndexedWithValueWithinNumSeconds(pubUri1, "Drontheim", 2));
        assertTrue(resourceIsIndexedWithValueWithinNumSeconds(pubUri2, "Drontheim", 2));

        // 6) Patch work series, and verify that publications get reindexed
        buildPatchRequest(
                resolveLocally(workSeriesUri),
                buildLDPatch(
                        buildPatchStatement("del", workSeriesUri, BaseURI.ontology("mainTitle"), "Harry Potter"),
                        buildPatchStatement("add", workSeriesUri, BaseURI.ontology("mainTitle"), "Cosmicomics"))).asString();

        assertTrue(resourceIsIndexedWithValueWithinNumSeconds(pubUri1, "Cosmicomics", 2));
        assertTrue(resourceIsIndexedWithValueWithinNumSeconds(pubUri2, "Cosmicomics", 2));
    }

    @Test
    public void test_z3950_resource_is_retrieved_and_mapped() throws UnirestException {
        z3950ServiceMock.getSingleMarcRecordExpectation();

        String url = appURI + "/datasource/bibbi/isbn/912312312312";

        HttpResponse<String> result = Unirest.get(url).asString();

        Gson gson = new GsonBuilder().setPrettyPrinting().create();
        MappingTester mappingTester = new MappingTester();
        String resultJson = mappingTester.simplifyBNodes(gson.toJson(new JsonParser().parse(result.getBody()).getAsJsonObject()));
        String comparisonJson = mappingTester.simplifyBNodes(new ResourceReader().readFile("BS_external_data_processed.json"));

        assertEquals(comparisonJson, resultJson);
    }

    @Test
    public void test_returns_record_ids_by_work() throws UnirestException {
        kohaSvcMock.addLoginExpectation();
        setUpKohaExpectation(SECOND_BIBLIO_ID);

        String triples = "<http://data.deichman.no/work/w1> "
                + "<http://data.deichman.no/ontology#mainTitle> \"Worky Title Titleson\" .\n";
        HttpResponse<JsonNode> createworkResponse = buildCreateRequestNtriples(appURI + "work", triples).asJson();
        String workURI = getLocation(createworkResponse);
        String publicationTriples = "<http://data.deichman.no/publication/p1> "
                + "<http://data.deichman.no/ontology#publicationOf> <" + workURI + "> .\n";
        buildCreateRequestNtriples(appURI + "publication", publicationTriples).asJson();

        HttpResponse<String> result = Unirest.get(workURI.replace("http://data.deichman.no/", appURI) + "/listRecordIds").asString();
        assertEquals("{\n"
                + "  \"recordIds\": [\n"
                + "    \"" + SECOND_BIBLIO_ID + "\"\n"
                + "  ]\n"
                + "}", result.getBody());

    }

    @Test
    public void test_returns_empty_record_ids_list() throws UnirestException {

        String triples = "<http://data.deichman.no/work/w1> "
                + "<http://data.deichman.no/ontology#mainTitle> \"Worky Title Titleson\" .\n";
        HttpResponse<JsonNode> createworkResponse = buildCreateRequestNtriples(appURI + "work", triples).asJson();
        String workURI = getLocation(createworkResponse);

        HttpResponse<String> result = Unirest.get(workURI.replace("http://data.deichman.no/", appURI) + "/listRecordIds").asString();
        assertEquals("{\n"
                + "  \"recordIds\": []\n"
                + "}", result.getBody());

    }

    @Test
    public void test_merges_resources() throws Exception {

        XURI replacee = new XURI("http://data.deichman.no/person/h1");
        XURI replacement = new XURI("http://data.deichman.no/person/h2");

        ResourceReader resourceReader = new ResourceReader();
        Model person1 = RDFModelUtil.modelFrom(resourceReader.readFile("merging_persons_replacee_person.ttl").replace("__REPLACE__", "#"), Lang.TURTLE);
        Model person2 = RDFModelUtil.modelFrom(resourceReader.readFile("merging_persons_replacement_person.ttl").replace("__REPLACE__", "#"), Lang.TURTLE);

        HttpResponse<String> response1 = Unirest.post(appURI + replacee.getType()).header("Content-type", "application/n-triples").body(RDFModelUtil.stringFrom(person1, Lang.NTRIPLES)).asString();
        HttpResponse<String> response2 = Unirest.post(appURI + replacement.getType()).header("Content-type", "application/n-triples").body(RDFModelUtil.stringFrom(person2, Lang.NTRIPLES)).asString();

        XURI replaceeXuri = new XURI(getLocation(response1));
        XURI replacementXuri = new XURI(getLocation(response2));

        Model work1 = RDFModelUtil.modelFrom(resourceReader.readFile("merging_work_1.ttl").replace("__REPLACE__", replaceeXuri.getUri()), Lang.TURTLE);
        Model work2 = RDFModelUtil.modelFrom(resourceReader.readFile("merging_work_2.ttl").replace("__REPLACE__", replacementXuri.getUri()), Lang.TURTLE);
        Model work3 = RDFModelUtil.modelFrom(resourceReader.readFile("merging_work_3_autobiography.ttl").replace("__REPLACE__", replaceeXuri.getUri()), Lang.TURTLE);

        HttpResponse<String> responseWork1 = Unirest.post(appURI + "work").header("Content-type", "application/n-triples").body(RDFModelUtil.stringFrom(work1, Lang.NTRIPLES)).asString();
        HttpResponse<String> responseWork2 = Unirest.post(appURI + "work").header("Content-type", "application/n-triples").body(RDFModelUtil.stringFrom(work2, Lang.NTRIPLES)).asString();
        HttpResponse<String> responseWork3 = Unirest.post(appURI + "work").header("Content-type", "application/n-triples").body(RDFModelUtil.stringFrom(work3, Lang.NTRIPLES)).asString();
        List<XURI> workXuris = new ArrayList<>();
        workXuris.add(new XURI(getLocation(responseWork1)));
        workXuris.add(new XURI(getLocation(responseWork2)));
        workXuris.add(new XURI(getLocation(responseWork3)));

        HttpResponse<String> result = buildReplaceRequest(replaceeXuri, replacementXuri);

        assertEquals(NO_CONTENT.getStatusCode(), result.getStatus());
        assertEquals(NOT_FOUND.getStatusCode(), Unirest.get(appURI + replaceeXuri.getType() + "/" + replaceeXuri.getId()).asString().getStatus());
        workXuris.forEach(s -> {
            try {
                String body = Unirest.get(appURI + s.getType() + "/" + s.getId()).asString().getBody();
                assertFalse(body.contains(replaceeXuri.getUri()));
                assertTrue(body.contains(replacementXuri.getUri()));
            } catch (UnirestException e) {
                e.printStackTrace();
            }
        });
    }

    @Test
    public void test_nonexistent_subject_resource_in_local_namespace_replacement_is_rejected() throws Exception {
        XURI replaceeXuri = new XURI("http://data.deichman.no/person/w1");
        XURI replacementXuri = new XURI("http://data.deichman.no/person/w2");
        HttpResponse<String> result = buildReplaceRequest(replaceeXuri, replacementXuri);
        assertEquals(NOT_FOUND.getStatusCode(), result.getStatus());
    }

    @Test
    public void test_badly_formed_request_is_rejected() throws Exception {

        XURI replacee = new XURI("http://data.deichman.no/person/h1");
        XURI replacement = new XURI("http://data.deichman.no/person/h2");

        ResourceReader resourceReader = new ResourceReader();
        Model person1 = RDFModelUtil.modelFrom(resourceReader.readFile("merging_persons_replacee_person.ttl").replace("__REPLACE__", "#"), Lang.TURTLE);
        Model person2 = RDFModelUtil.modelFrom(resourceReader.readFile("merging_persons_replacement_person.ttl").replace("__REPLACE__", "#"), Lang.TURTLE);

        HttpResponse<String> response1 = Unirest.post(appURI + replacee.getType()).header("Content-type", "application/n-triples").body(RDFModelUtil.stringFrom(person1, Lang.NTRIPLES)).asString();
        HttpResponse<String> response2 = Unirest.post(appURI + replacement.getType()).header("Content-type", "application/n-triples").body(RDFModelUtil.stringFrom(person2, Lang.NTRIPLES)).asString();
        XURI mergeResponseXuri = new XURI(getLocation(response1));
        HttpResponse<String> mergeResponse = Unirest
                .put(appURI + mergeResponseXuri.getType() + "/" + mergeResponseXuri.getId() + "/merge")
                .header("Content-type", "application/json")
                .body("{\"replacce\": \"" + getLocation(response2) + "\"}")
                .asString();

        assertEquals(BAD_REQUEST.getStatusCode(), mergeResponse.getStatus());
    }

    private Boolean resourceIsIndexed(String uri) throws Exception {
        Boolean found = false;
        List<String> docs = embeddedElasticsearchServer.getClient().fetchAllDocuments("search");
        for (String doc : docs) {
            if (doc.contains(uri)) {
                found = true;
                break;
            }
        }
       return found;
    }

    private Boolean resourceIsIndexedWithValue(String uri, String value) throws Exception {
        List<String> docs = embeddedElasticsearchServer.getClient().fetchAllDocuments("search");
        Boolean found = false;
        for (String doc : docs) {
            if (doc.contains(uri) && doc.contains(value)) {
                found = true;
                break;
            }
        }
        return found;
    }

    private Boolean resourceIsIndexedWithinNumSeconds(String uri, Integer numSeconds) throws Exception {
        Integer c = 0;
        while (c <= numSeconds) {
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
        while (c <= numSeconds) {
            if (resourceIsIndexedWithValue(uri, value)) {
                return true;
            }
            Thread.sleep(ONE_SECOND);
            c++;
        }
        return false;
    }
}
