package no.deichman.services.entity;

import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.rdf.model.ResourceFactory;
import org.apache.jena.rdf.model.Statement;
import no.deichman.services.entity.kohaadapter.KohaAdapter;
import no.deichman.services.entity.repository.InMemoryRepository;
import no.deichman.services.uridefaults.BaseURI;
import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFDataMgr;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;

import javax.ws.rs.BadRequestException;
import javax.ws.rs.NotFoundException;
import javax.ws.rs.core.Response;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.net.URISyntaxException;
import java.nio.charset.StandardCharsets;
import java.util.regex.Pattern;

import static javax.ws.rs.core.Response.Status.CREATED;
import static javax.ws.rs.core.Response.Status.NOT_FOUND;
import static javax.ws.rs.core.Response.Status.NO_CONTENT;
import static javax.ws.rs.core.Response.Status.OK;
import static no.deichman.services.entity.EntityServiceImplTest.modelForBiblio;
import static no.deichman.services.entity.repository.InMemoryRepositoryTest.repositoryWithDataFrom;
import static no.deichman.services.testutil.TestJSON.assertValidJSON;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;
import static org.mockito.Mockito.when;

@RunWith(MockitoJUnitRunner.class)
public class EntityResourceTest {

    private static final String SOME_WORK_IDENTIFIER = "SOME_WORK_IDENTIFIER";
    private EntityResource entityResource;
    private BaseURI baseURI;

    @Mock
    private KohaAdapter mockKohaAdapter;

    @Before
    public void setUp() throws Exception {
        baseURI = BaseURI.local();
        EntityServiceImpl service = new EntityServiceImpl(baseURI, new InMemoryRepository(), mockKohaAdapter);
        entityResource = new EntityResource(baseURI, service);
    }

    @Test
    public void should_have_default_constructor() {
        assertNotNull(new EntityResource());
    }

    @Test
    public void get_should_return_a_valid_json_work() {
        entityResource = new EntityResource(baseURI, new EntityServiceImpl(baseURI, repositoryWithDataFrom("testdata.ttl"), null));
        String workId = "work_00001";

        Response result = entityResource.get("work", workId);

        assertNotNull(result);
        assertEquals(OK.getStatusCode(), result.getStatus());
        assertValidJSON(result.getEntity().toString());
    }

    @Test(expected = NotFoundException.class)
    public void get_should_throw_exception_when_work_is_not_found() {
        String workId = "work_DOES_NOT_EXIST";
        entityResource.get("work", workId);
    }

    @Test
    public void create_should_return_201_when_work_created() throws URISyntaxException {
        String work = createTestWork(SOME_WORK_IDENTIFIER);
        Response result = entityResource.createFromLDJSON("work", work);

        assertNull(result.getEntity());
        assertEquals(CREATED.getStatusCode(), result.getStatus());
    }

    @Test
    public void create_should_return_location_header_when_work_created() throws URISyntaxException {
        String work = createTestWork(SOME_WORK_IDENTIFIER);

        Response result = entityResource.createFromLDJSON("work", work);

        String workURI = baseURI.work();

        assertNull(result.getEntity());
        assertTrue(Pattern.matches(workURI + "w\\d{12}", result.getHeaderString("Location")));
    }

    @Test
    public void update_should_return_200_when_work_updated() {
        String work = createTestWork(SOME_WORK_IDENTIFIER);
        Response result = entityResource.update("work", work);

        assertNull(result.getEntity());
        assertEquals(OK.getStatusCode(), result.getStatus());
    }

    @Test
    public void create_should_return_the_new_work() throws URISyntaxException{
        String work = createTestWork(SOME_WORK_IDENTIFIER);

        Response createResponse = entityResource.createFromLDJSON("work", work);

        String workId = createResponse.getHeaderString("Location").replaceAll("http://deichman.no/work/", "");

        Response result = entityResource.get("work", workId);

        assertNotNull(result);
        assertEquals(CREATED.getStatusCode(), createResponse.getStatus());
        assertEquals(OK.getStatusCode(), result.getStatus());
        assertValidJSON(result.getEntity().toString());
    }

    private String createTestWork(String identifier) {
        return "{\n"
                    + "    \"@context\": {\n"
                    + "        \"dcterms\": \"http://purl.org/dc/terms/\",\n"
                    + "        \"deichman\": \"http://deichman.no/ontology#\"\n"
                    + "    },\n"
                    + "    \"@graph\": {\n"
                    + "        \"@id\": \"http://deichman.no/work/" + identifier + "\",\n"
                    + "        \"@type\": \"deichman:Work\",\n"
                    + "        \"dcterms:identifier\": \"" + identifier + "\"\n"
                    + "    }\n"
                    + "}";
    }

    @Test
    public void get_work_items_should_return_list_of_items(){
        when(mockKohaAdapter.getBiblio("626460")).thenReturn(modelForBiblio());

        entityResource = new EntityResource(baseURI, new EntityServiceImpl(baseURI, repositoryWithDataFrom("testdata.ttl"), mockKohaAdapter));

        String workId = "work_TEST_KOHA_ITEMS_LINK";

        Response result = entityResource.getWorkItems(workId, "work");

        assertNotNull(result);
        assertEquals(OK.getStatusCode(), result.getStatus());
        assertValidJSON(result.getEntity().toString());
    }

    @Test(expected=NotFoundException.class)
    public void get_work_items_should_404_on_empty_items_list(){
        Response result = entityResource.getWorkItems("DOES_NOT_EXIST", "work");
        assertEquals(result.getStatus(), NOT_FOUND.getStatusCode());
    }

    @Test
    public void patch_with_invalid_data_should_return_status_400() throws Exception {
        String work = createTestWork(SOME_WORK_IDENTIFIER);
        Response result = entityResource.createFromLDJSON("work", work);
        String workId = result.getLocation().getPath().substring("/work/".length());
        String patchData = "{}";
        try {
            entityResource.patch("work", workId,patchData);
            fail("HTTP 400 Bad Request");
        } catch (BadRequestException bre) {
            assertEquals("HTTP 400 Bad Request", bre.getMessage());
        }
    }

    @Test(expected = NotFoundException.class)
    public void patch_on_a_non_existing_resource_should_return_404() throws Exception {
        entityResource.patch("work", "a_missing_work1234", "{}");
    }

    @Test(expected=NotFoundException.class)
    public void delete__non_existing_work_should_raise_not_found_exception(){
        entityResource.delete("work", "work_DOES_NOT_EXIST_AND_FAILS");
    }

    @Test
    public void delete_existing_work_should_return_no_content() throws URISyntaxException{
        String work = createTestWork(SOME_WORK_IDENTIFIER);
        Response createResponse = entityResource.createFromLDJSON("work", work);
        String workId = createResponse.getHeaderString("Location").replaceAll("http://deichman.no/work/", "");
        Response response = entityResource.delete("work", workId);
        assertEquals(response.getStatus(), NO_CONTENT.getStatusCode());
    }

    private static final String A_BIBLIO_ID = "1234";

    private String createTestPublicationJSON(String id) {
        return "{\"@context\": "
                + "{\"dcterms\": \"http://purl.org/dc/terms/\","
                + "\"deichman\": \"http://deichman.no/ontology#\"},"
                + "\"@graph\": "
                + "{\"@id\": \"http://deichman.no/publication/" + id + "\","
                + "\"@type\": \"deichman:Publication\","
                + "\"dcterms:identifier\":\"" + id + "\"}}";
    }

    @Test
    public void create_should_return_201_when_publication_created() throws Exception{
        when(mockKohaAdapter.getNewBiblio()).thenReturn(A_BIBLIO_ID);
        Response result = entityResource.createFromLDJSON("publication", createTestPublicationJSON("publication_SHOULD_EXIST"));
        assertNull(result.getEntity());
        assertEquals(CREATED.getStatusCode(), result.getStatus());
    }

    @Test
    public void location_returned_from_create_should_return_the_new_publication() throws Exception{
        when(mockKohaAdapter.getNewBiblio()).thenReturn(A_BIBLIO_ID);
        Response createResponse = entityResource.createFromLDJSON("publication", createTestPublicationJSON("publication_SHOULD_EXIST"));

        String publicationId = createResponse.getHeaderString("Location").replaceAll("http://deichman.no/publication/", "");

        Response result = entityResource.get("publication", publicationId);

        assertNotNull(result);
        assertEquals(CREATED.getStatusCode(), createResponse.getStatus());
        assertEquals(OK.getStatusCode(), result.getStatus());
        assertTrue(result.getEntity().toString().contains("\"deichman:recordID\""));
        assertValidJSON(result.getEntity().toString());
    }

    @Test
    public void delete_publication_should_return_no_content() throws Exception{
        when(mockKohaAdapter.getNewBiblio()).thenReturn(A_BIBLIO_ID);
        Response createResponse = entityResource.createFromLDJSON("publication", createTestPublicationJSON("publication_SHOULD_BE_PATCHABLE"));
        String publicationId = createResponse.getHeaderString("Location").replaceAll("http://deichman.no/publication/", "");
        Response response = entityResource.delete("publication", publicationId);
        assertEquals(NO_CONTENT.getStatusCode(), response.getStatus());
    }

    @Test
    public void patch_should_actually_persist_changes() throws Exception {
        when(mockKohaAdapter.getNewBiblio()).thenReturn(A_BIBLIO_ID);
        String publication = createTestPublicationJSON("publication_SHOULD_BE_PATCHABLE");
        Response result = entityResource.createFromLDJSON("publication", publication);
        String publicationId = result.getLocation().getPath().substring("/publication/".length());
        String patchData = "{"
                + "\"op\": \"add\","
                + "\"s\": \"" + result.getLocation().toString() + "\","
                + "\"p\": \"http://deichman.no/ontology#color\","
                + "\"o\": {"
                + "\"value\": \"red\""
                + "}"
                + "}";
        Response patchResponse = entityResource.patch("publication", publicationId, patchData);
        Model testModel = ModelFactory.createDefaultModel();
        String response = patchResponse.getEntity().toString();
        InputStream in = new ByteArrayInputStream(response.getBytes(StandardCharsets.UTF_8));
        RDFDataMgr.read(testModel, in, Lang.JSONLD);
        Statement s = ResourceFactory.createStatement(
                ResourceFactory.createResource(result.getLocation().toString()),
                ResourceFactory.createProperty("http://deichman.no/ontology#color"),
                ResourceFactory.createPlainLiteral("red"));
        assertTrue(testModel.contains(s));
    }

    @Test
    public void work_should_have_language_labels() throws URISyntaxException {
        String work = "{\n"
                + "    \"@context\": {\n"
                + "        \"rdfs\": \"http://www.w3.org/2000/01/rdf-schema#\",\n"
                + "        \"deichman\": \"http://deichman.no/ontology#\"\n"
                + "    },\n"
                + "    \"@graph\": {\n"
                + "        \"@id\": \"http://deichman.no/publication/work_should_have_language_labels\",\n"
                + "        \"@type\": \"deichman:Work\"\n,"
                + "        \"deichman:language\": \"http://lexvo.org/id/iso639-3/eng\"\n"
                + "    }\n"
                + "}";
        Response createResponse = entityResource.createFromLDJSON("work", work);
        String workId = createResponse.getHeaderString("Location").replaceAll("http://deichman.no/work/", "");
        Response result = entityResource.get("work", workId);

        String labelsComparison = "{\n"
                + "    \"@id\" : \"http://lexvo.org/id/iso639-3/eng\",\n"
                + "    \"@type\" : \"http://lexvo.org/ontology#Language\",\n"
                + "    \"rdfs:label\" : {\n"
                + "      \"@language\" : \"no\",\n"
                + "      \"@value\" : \"Engelsk\"\n"
                + "    }\n"
                + "  }";

        assertEquals(OK.getStatusCode(), result.getStatus());
        assertTrue(result.getEntity().toString().contains(labelsComparison));
    }

    @Test
    public void work_should_have_format_labels() throws URISyntaxException {
        String work = "{\n"
                + "    \"@context\": {\n"
                + "        \"rdfs\": \"http://www.w3.org/2000/01/rdf-schema#\",\n"
                + "        \"deichman\": \"http://deichman.no/ontology#\"\n"
                + "    },\n"
                + "    \"@graph\": {\n"
                + "        \"@id\": \"http://deichman.no/publication/work_should_have_language_labels\",\n"
                + "        \"@type\": \"deichman:Work\"\n,"
                + "        \"deichman:format\": \"http://data.deichman.no/format#Book\"\n"
                + "    }\n"
                + "}";
        Response createResponse = entityResource.createFromLDJSON("work", work);
        String workId = createResponse.getHeaderString("Location").replaceAll("http://deichman.no/work/", "");
        Response result = entityResource.get("work", workId);

        String labelsComparison = "{\n"
                + "    \"@id\" : \"http://data.deichman.no/format#Book\",\n"
                + "    \"@type\" : \"http://data.deichman.no/utility#Format\",\n"
                + "    \"rdfs:label\" : {\n"
                + "      \"@language\" : \"no\",\n"
                + "      \"@value\" : \"Bok\"\n"
                + "    }\n"
                + "  }";
        assertEquals(OK.getStatusCode(), result.getStatus());
        assertTrue(result.getEntity().toString().contains(labelsComparison));
    }
}
