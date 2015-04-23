package no.deichman.services.resources;

import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.ws.rs.NotFoundException;
import javax.ws.rs.core.Response;
import no.deichman.services.kohaadapter.KohaAdapterMock;
import no.deichman.services.repository.RepositoryInMemory;
import org.codehaus.jackson.JsonNode;
import org.codehaus.jackson.JsonParser;
import org.codehaus.jackson.map.ObjectMapper;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;
import org.junit.Before;
import org.junit.Test;

public class WorkResourceTest{

    private static final Logger LOG = Logger.getLogger(WorkResourceTest.class.getName());

    private WorkResource resource;

    @Before
    public void setUp() throws Exception {
        resource = new WorkResource(new KohaAdapterMock(), new RepositoryInMemory());
    }

    @Test
    public void should_return_non_empty_json_list_of_Work() {
        Response result = resource.listWork();

        assertNotNull(result);
        assertEquals(200, result.getStatus());
        assertTrue(isValidJSON(result.getEntity().toString()));
        assertNotNull(parseJSON(result.getEntity().toString()).findValue("@id"));
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
    public void should_return_201_when_work_created() {
        String work = "{\"@context\": {\"dcterms\": \"http://purl.org/dc/terms/\",\"deichman\": \"http://deichman.no/ontology#\"},\"@graph\": {\"@id\": \"http://deichman.no/work/work_SHOULD_EXIST\",\"@type\": \"deichman:Work\",\"dcterms:identifier\":\"work_SHOULD_EXIST\"}}";
        Response result = resource.createWork(work);

        assertNull(result.getEntity());
        assertEquals(201, result.getStatus());
    }
    
    @Test
    public void should_return_the_new_work(){
        String work = "{\"@context\": {\"dcterms\": \"http://purl.org/dc/terms/\",\"deichman\": \"http://deichman.no/ontology#\"},\"@graph\": {\"@id\": \"http://deichman.no/work/work_SHOULD_EXIST\",\"@type\": \"deichman:Work\",\"dcterms:identifier\":\"work_SHOULD_EXIST\"}}";
        String workId = "work_SHOULD_EXIST";

        Response createResponse = resource.createWork(work);
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

        Response createResponse = resource.createWork(work);
        Response result = resource.getWorkItems(workId);

        assertEquals(201, createResponse.getStatus());
        assertNotNull(result);
        assertEquals(200, result.getStatus());
        assertTrue(isValidJSON(result.getEntity().toString()));

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

    private JsonNode parseJSON(final String json) {
        try {
            return new ObjectMapper().readTree(json);
        } catch (IOException ex) {
            LOG.log(Level.SEVERE, null, ex);
        }
        return null;
    }
}
