package no.deichman.services.resources;

import com.fasterxml.jackson.core.JsonParseException;
import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.ws.rs.NotFoundException;
import javax.ws.rs.core.Response;
import no.deichman.services.repository.RepositoryInMemory;
import no.deichman.services.resources.WorkResource;
import no.deichman.services.service.ServiceDefault;
import org.codehaus.jackson.JsonNode;
import org.codehaus.jackson.JsonParser;
import org.codehaus.jackson.map.ObjectMapper;
import org.junit.After;
import org.junit.AfterClass;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;

public class WorkResourceTest{


    @BeforeClass
    public static void setUpClass() throws Exception {
        ServiceDefault.setRepository(new RepositoryInMemory());
    }

    @AfterClass
    public static void tearDownClass() throws Exception {
    }

    @Before
    public void setUp() throws Exception {
    }

    @After
    public void tearDown() throws Exception {
    }

    /**
     * Test of listWork method, of class WorkResource.
     */
    @Test
    public void should_return_non_empty_json_list_of_Work() {
        WorkResource instance = new WorkResource();
        Response expResult = null;
        Response result = instance.listWork();
        assertNotNull(result);
        assertEquals(200, result.getStatus());
        assertTrue(isValidJSON(result.getEntity().toString()));
        assertNotNull(parseJSON(result.getEntity().toString()).findValue("@id"));
    }

    /**
     * Test of getWork method, of class WorkResource.
     */
    @Test
    public void should_return_a_valid_json_work() {
        String workId = "work_00001";
        WorkResource instance = new WorkResource();
        Response result = instance.getWorkJSON(workId);            
        assertNotNull(result);
        assertEquals(200, result.getStatus());
        assertTrue(isValidJSON(result.getEntity().toString()));
    }

    /**
     * Test of getWork method, of class WorkResource.
     */
    @Test(expected = NotFoundException.class)
    public void should_throw_exception_when_work_is_not_found() {
        String workId = "work_DOES_NOT_EXIST";
        WorkResource instance = new WorkResource();
        Response result = instance.getWorkJSON(workId);            
    }

    /**
     * Test of getWork method, of class WorkResource.
     */
    @Test
    public void should_return_201_when_work_created() {
        String workId = "work_DOES_NOT_EXIST";
        WorkResource instance = new WorkResource();
        Response result = instance.createWork(workId);     
        assertNull(result.getEntity());
        assertEquals(201, result.getStatus());
    }
    
    /**
     * Test of getWork method, of class WorkResource.
     */
    @Test
    public void should_return_the_new_work(){
        String workId = "work_DOES_NOT_EXIST";
        WorkResource instance = new WorkResource();
        instance.createWork(workId);     
        Response result = instance.getWorkJSON(workId);            
        assertNotNull(result);
        assertEquals(200, result.getStatus());
        assertTrue(isValidJSON(result.getEntity().toString()));
    }
    
    public boolean isValidJSON(final String json) {
        boolean valid = false;
        try {
            final JsonParser parser = new ObjectMapper().getJsonFactory()
                    .createJsonParser(json);
            while (parser.nextToken() != null) {
            }
            valid = true;
        } catch (JsonParseException jpe) {
            jpe.printStackTrace();
        } catch (IOException ioe) {
            ioe.printStackTrace();
        }

        return valid;
    }

    private JsonNode parseJSON(final String json) {
        try {
            JsonNode node = new ObjectMapper().readTree(json);
            return node;
        } catch (IOException ex) {
            Logger.getLogger(WorkResourceTest.class.getName()).log(Level.SEVERE, null, ex);
        }
        return null;
    }
}
