package no.deichman.services.rest;

import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;
import com.hp.hpl.jena.rdf.model.ResourceFactory;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URISyntaxException;
import java.nio.charset.StandardCharsets;
import java.util.regex.Pattern;
import javax.ws.rs.BadRequestException;
import javax.ws.rs.NotFoundException;
import javax.ws.rs.core.Response;
import static javax.ws.rs.core.Response.Status.CREATED;
import static javax.ws.rs.core.Response.Status.NOT_FOUND;
import static javax.ws.rs.core.Response.Status.NO_CONTENT;
import static javax.ws.rs.core.Response.Status.OK;
import no.deichman.services.kohaadapter.KohaAdapter;
import no.deichman.services.kohaadapter.Marc2Rdf;
import no.deichman.services.repository.RepositoryInMemory;
import no.deichman.services.service.ServiceImpl;
import no.deichman.services.uridefaults.BaseURIMock;
import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFDataMgr;
import org.codehaus.jackson.JsonParser;
import org.codehaus.jackson.map.ObjectMapper;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;
import org.junit.Before;
import org.junit.Test;
import org.marc4j.MarcReader;
import org.marc4j.MarcXmlReader;
import org.marc4j.marc.Record;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class WorkResourceTest {

    private WorkResource resource;
    private BaseURIMock bum;

    @Before
    public void setUp() throws Exception {
        bum = new BaseURIMock();
        resource = new WorkResource(bum, new ServiceImpl(bum, new RepositoryInMemory(), null));
    }

    @Test
    public void should_have_default_constructor() {
        assertNotNull(new WorkResource());
    }

    @Test
    public void should_return_a_valid_json_work() {
        String workId = "work_00001";
        Response result = resource.getWorkJSON(workId);

        assertNotNull(result);
        assertEquals(OK.getStatusCode(), result.getStatus());
        assertTrue(isValidJSON(result.getEntity().toString()));
    }

    @Test(expected = NotFoundException.class)
    public void should_throw_exception_when_work_is_not_found() {
        String workId = "work_DOES_NOT_EXIST";
        resource.getWorkJSON(workId);
    }

    @Test
    public void should_return_201_when_work_created() throws URISyntaxException {
        String work = "{\"@context\": {\"dcterms\": \"http://purl.org/dc/terms/\",\"deichman\": \"http://deichman.no/ontology#\"},\"@graph\": {\"@id\": \"http://deichman.no/work/work_SHOULD_EXIST\",\"@type\": \"deichman:Work\",\"dcterms:identifier\":\"work_SHOULD_EXIST\"}}";

        Response result = resource.createWork(work);

        assertNull(result.getEntity());
        assertEquals(CREATED.getStatusCode(), result.getStatus());
    }

    @Test
    public void should_return_location_header_when_work_created() throws URISyntaxException {
        String work = "{\"@context\": {\"dcterms\": \"http://purl.org/dc/terms/\",\"deichman\": \"http://deichman.no/ontology#\"},\"@graph\": {\"@id\": \"http://deichman.no/work/work_SHOULD_EXIST\",\"@type\": \"deichman:Work\",\"dcterms:identifier\":\"work_SHOULD_EXIST\"}}";

        Response result = resource.createWork(work);

        String workURI = bum.getWorkURI();

        assertNull(result.getEntity());
        assertTrue(Pattern.matches(workURI + "w\\d{12}", result.getHeaderString("Location")));
    }

    @Test
    public void should_return_200_when_work_updated() {
        String work = "{\"@context\": {\"dcterms\": \"http://purl.org/dc/terms/\",\"deichman\": \"http://deichman.no/ontology#\"},\"@graph\": {\"@id\": \"http://deichman.no/work/work_SHOULD_EXIST\",\"@type\": \"deichman:Work\",\"dcterms:identifier\":\"work_SHOULD_EXIST\"}}";
        Response result = resource.updateWork(work);

        assertNull(result.getEntity());
        assertEquals(OK.getStatusCode(), result.getStatus());
    }

    @Test
    public void should_return_the_new_work() throws URISyntaxException{
        String work = "{\"@context\": {\"dcterms\": \"http://purl.org/dc/terms/\",\"deichman\": \"http://deichman.no/ontology#\"},\"@graph\": {\"@id\": \"http://deichman.no/work/work_SHOULD_EXIST\",\"@type\": \"deichman:Work\",\"dcterms:identifier\":\"work_SHOULD_EXIST\"}}";

        Response createResponse = resource.createWork(work);

        String workId = createResponse.getHeaderString("Location").replaceAll("http://deichman.no/work/", "");

        Response result = resource.getWorkJSON(workId);

        assertNotNull(result);
        assertEquals(CREATED.getStatusCode(), createResponse.getStatus());
        assertEquals(OK.getStatusCode(), result.getStatus());
        assertTrue(isValidJSON(result.getEntity().toString()));
    }

    private Model modelForBiblio() { // TODO return much simpler model
        Model model = ModelFactory.createDefaultModel();
        Model m = ModelFactory.createDefaultModel();
        InputStream in = getClass().getClassLoader().getResourceAsStream("marc.xml");
        MarcReader reader = new MarcXmlReader(in);
        Marc2Rdf marcRdf = new Marc2Rdf(new BaseURIMock());
        while (reader.hasNext()) {
            Record record = reader.next();
            m.add(marcRdf.mapItemsToModel(record.getVariableFields("952")));
        }
        model.add(m);
        return model;
    }

    @Test
    public void should_return_list_of_items(){
        KohaAdapter mockKohaAdapter = mock(KohaAdapter.class);
        when(mockKohaAdapter.getBiblio("1")).thenReturn(modelForBiblio());

        WorkResource myResource = new WorkResource(bum, new ServiceImpl(bum, new RepositoryInMemory(), mockKohaAdapter));

        String work = "{\"@context\": {\"dcterms\": \"http://purl.org/dc/terms/\",\"deichman\": \"http://deichman.no/ontology#\"},\"@graph\": {\"@id\": \"http://deichman.no/work/work_SHOULD_EXIST\",\"@type\": \"deichman:Work\",\"dcterms:identifier\":\"work_SHOULD_EXIST\",\"deichman:biblio\":\"1\"}}";
        String workId = "work_SHOULD_EXIST";

        Response createResponse = myResource.updateWork(work);
        Response result = myResource.getWorkItems(workId);

        assertEquals(OK.getStatusCode(), createResponse.getStatus());
        assertNotNull(result);
        assertEquals(OK.getStatusCode(), result.getStatus());
        assertTrue(isValidJSON(result.getEntity().toString()));
    }

    @Test(expected=NotFoundException.class)
    public void should_404_on_empty_items_list(){
        Response result = resource.getWorkItems("DOES_NOT_EXIST");
        assertEquals(result.getStatus(), NOT_FOUND.getStatusCode());
    }

    @Test
    public void patch_should_return_status_400() throws Exception {
        String work = "{\"@context\": {\"dcterms\": \"http://purl.org/dc/terms/\",\"deichman\": \"http://deichman.no/ontology#\"},\"@graph\": {\"@id\": \"http://deichman.no/work/work_SHOULD_BE_PATCHABLE\",\"@type\": \"deichman:Work\",\"dcterms:identifier\":\"work_SHOULD_BE_PATCHABLE\"}}";
        Response result = resource.createWork(work);
        String workId = result.getLocation().getPath().substring("/work/".length());
        String patchData = "{}";
        try {
            resource.patchWork(workId,patchData);
            fail("HTTP 400 Bad Request");
        } catch (BadRequestException bre) {
            assertEquals("HTTP 400 Bad Request", bre.getMessage());
        }
    }

    @Test
    public void patched_work_should_persist_changes() throws Exception {
        String work = "{\"@context\": {\"dcterms\": \"http://purl.org/dc/terms/\",\"deichman\": \"http://deichman.no/ontology#\"},\"@graph\": {\"@id\": \"http://deichman.no/work/work_SHOULD_BE_PATCHABLE\",\"@type\": \"deichman:Work\",\"dcterms:identifier\":\"work_SHOULD_BE_PATCHABLE\"}}";
        Response result = resource.createWork(work);
        String workId = result.getLocation().getPath().substring("/work/".length());
        String patchData = "{"
                + "\"op\": \"add\","
                + "\"s\": \"" + result.getLocation().toString() + "\","
                + "\"p\": \"http://deichman.no/ontology#color\","
                + "\"o\": {"
                + "\"value\": \"red\""
                + "}"
                + "}";
        Response patchResponse = resource.patchWork(workId,patchData);
        Model testModel = ModelFactory.createDefaultModel();
        Model comparison = ModelFactory.createDefaultModel();
        String response = patchResponse.getEntity().toString();
        InputStream in = new ByteArrayInputStream(response.getBytes(StandardCharsets.UTF_8));
        RDFDataMgr.read(testModel, in, Lang.JSONLD);
        String adaptedWork = work.replace("/work_SHOULD_BE_PATCHABLE", "/" + workId);
        InputStream in2 = new ByteArrayInputStream(adaptedWork.getBytes(StandardCharsets.UTF_8));
        RDFDataMgr.read(comparison,in2, Lang.JSONLD);
        comparison.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(result.getLocation().toString()), 
                ResourceFactory.createProperty("http://deichman.no/ontology#color"), 
                ResourceFactory.createPlainLiteral("red")));
        assertTrue(testModel.isIsomorphicWith(comparison));
    }

    @Test(expected = NotFoundException.class)
    public void patching_a_non_existing_resource_should_return_404() throws Exception {
        resource.patchWork("a_missing_work1234", "{}");
    }

    @Test
    public void test_CORS_work_base(){
        String reqHeader = "application/ld+json";
        Response reponse = resource.corsWorkBase(reqHeader);
        assertEquals(reponse.getHeaderString("Access-Control-Allow-Headers"),reqHeader);
        assertEquals(reponse.getHeaderString("Access-Control-Allow-Origin"),"*");
        assertEquals(reponse.getHeaderString("Access-Control-Allow-Methods"),"GET, POST, OPTIONS, PUT, PATCH");
    }

    @Test
    public void test_CORS_work_base_empty_request_header(){
        String reqHeader = "";
        Response response = resource.corsWorkBase(reqHeader);
        assert(response.getHeaderString("Access-Control-Allow-Headers") == null);
        assertEquals(response.getHeaderString("Access-Control-Allow-Origin"),"*");
        assertEquals(response.getHeaderString("Access-Control-Allow-Methods"),"GET, POST, OPTIONS, PUT, PATCH");
    }

    @Test(expected=NotFoundException.class)
    public void test_delete_work_raises_not_found_exception(){
        resource.deleteWork("work_DOES_NOT_EXIST_AND_FAILS");
    }

    @Test
    public void test_delete_work() throws URISyntaxException{
        String work = "{\"@context\": {\"dcterms\": \"http://purl.org/dc/terms/\",\"deichman\": \"http://deichman.no/ontology#\"},\"@graph\": {\"@id\": \"http://deichman.no/work/work_SHOULD_BE_PATCHABLE\",\"@type\": \"deichman:Work\",\"dcterms:identifier\":\"work_SHOULD_BE_PATCHABLE\"}}";
        Response createResponse = resource.createWork(work);
        String workId = createResponse.getHeaderString("Location").replaceAll("http://deichman.no/work/", "");
        Response response = resource.deleteWork(workId);
        assertEquals(response.getStatus(), NO_CONTENT.getStatusCode());
    }

    @Test
    public void test_CORS_work_id(){
        String reqHeader = "application/ld+json";
        Response reponse = resource.corsWorkId(reqHeader);
        assertEquals(reponse.getHeaderString("Access-Control-Allow-Headers"),reqHeader);
        assertEquals(reponse.getHeaderString("Access-Control-Allow-Origin"),"*");
        assertEquals(reponse.getHeaderString("Access-Control-Allow-Methods"),"GET, POST, OPTIONS, PUT, PATCH");
    }

    @Test
    public void test_CORS_work_id_empty_request_header(){
        String reqHeader = "";
        Response response = resource.corsWorkId(reqHeader);
        assert(response.getHeaderString("Access-Control-Allow-Headers") == null);
        assertEquals(response.getHeaderString("Access-Control-Allow-Origin"),"*");
        assertEquals(response.getHeaderString("Access-Control-Allow-Methods"),"GET, POST, OPTIONS, PUT, PATCH");
    }

    private boolean isValidJSON(final String json) {
        boolean valid = false;
        try {
            final JsonParser parser = new ObjectMapper().getJsonFactory().createJsonParser(json);
            while (parser.nextToken() != null) {
                // NOOP
            }
            valid = true;
        } catch (IOException ioe) {
            ioe.printStackTrace();
        }

        return valid;
    }
}
