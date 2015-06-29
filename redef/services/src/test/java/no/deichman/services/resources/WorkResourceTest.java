package no.deichman.services.resources;

import no.deichman.services.kohaadapter.KohaAdapterMock;
import no.deichman.services.repository.RepositoryInMemory;
import no.deichman.services.uridefaults.BaseURIMock;

import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFDataMgr;
import org.codehaus.jackson.JsonParser;
import org.codehaus.jackson.map.ObjectMapper;
import org.junit.Before;
import org.junit.Test;

import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;
import com.hp.hpl.jena.rdf.model.ResourceFactory;

import javax.ws.rs.BadRequestException;
import javax.ws.rs.NotFoundException;
import javax.ws.rs.core.Response;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URISyntaxException;
import java.nio.charset.StandardCharsets;
import java.util.regex.Pattern;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

public class WorkResourceTest {

    private WorkResource resource;
    private BaseURIMock bum;

    @Before
    public void setUp() throws Exception {
        resource = new WorkResource(new KohaAdapterMock(), new RepositoryInMemory(), new BaseURIMock());
        bum = new BaseURIMock();
    }

    @Test
    public void test_class_exists(){
        assertNotNull(new WorkResource());
    }

    @Test
    public void should_return_a_valid_json_work() {
        String workId = "work_00001";
        Response result = resource.getWorkJSON(workId);

        assertNotNull(result);
        assertEquals(200, result.getStatus());
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
        assertEquals(201, result.getStatus());
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
        assertEquals(200, result.getStatus());
    }


    @Test
    public void should_return_the_new_work() throws URISyntaxException{
        String work = "{\"@context\": {\"dcterms\": \"http://purl.org/dc/terms/\",\"deichman\": \"http://deichman.no/ontology#\"},\"@graph\": {\"@id\": \"http://deichman.no/work/work_SHOULD_EXIST\",\"@type\": \"deichman:Work\",\"dcterms:identifier\":\"work_SHOULD_EXIST\"}}";

        Response createResponse = resource.createWork(work);

        String workId = createResponse.getHeaderString("Location").replaceAll("http://deichman.no/work/", "");

        Response result = resource.getWorkJSON(workId);

        assertNotNull(result);
        assertEquals(201, createResponse.getStatus());
        assertEquals(200, result.getStatus());
        assertTrue(isValidJSON(result.getEntity().toString()));
    }

    @Test
    public void should_return_list_of_items(){
        String work = "{\"@context\": {\"dcterms\": \"http://purl.org/dc/terms/\",\"deichman\": \"http://deichman.no/ontology#\"},\"@graph\": {\"@id\": \"http://deichman.no/work/work_SHOULD_EXIST\",\"@type\": \"deichman:Work\",\"dcterms:identifier\":\"work_SHOULD_EXIST\",\"deichman:biblioId\":\"1\"}}";
        String workId = "work_SHOULD_EXIST";

        Response createResponse = resource.updateWork(work);
        Response result = resource.getWorkItems(workId);

        assertEquals(200, createResponse.getStatus());
        assertNotNull(result);
        assertEquals(200, result.getStatus());
        assertTrue(isValidJSON(result.getEntity().toString()));
    }

    @Test
    public void patch_should_return_status_400() throws Exception {
        String work = "{\"@context\": {\"dcterms\": \"http://purl.org/dc/terms/\",\"deichman\": \"http://deichman.no/ontology#\"},\"@graph\": {\"@id\": \"http://deichman.no/work/work_SHOULD_BE_PATCHABLE\",\"@type\": \"deichman:Work\",\"dcterms:identifier\":\"work_SHOULD_BE_PATCHABLE\"}}";
        Response result = resource.createWork(work);
        String workId = result.getLocation().getPath().substring(6);
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
        String workId = result.getLocation().getPath().substring(6);
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

    private boolean isValidJSON(final String json) {
        boolean valid = false;
        try {
            final JsonParser parser = new ObjectMapper().getJsonFactory().createJsonParser(json);
            while (parser.nextToken() != null) {
            }
            valid = true;
        } catch (IOException ioe) {
            ioe.printStackTrace();
        }

        return valid;
    }
}
