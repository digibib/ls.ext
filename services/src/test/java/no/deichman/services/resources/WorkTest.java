/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package no.deichman.services.resources;

import com.fasterxml.jackson.core.JsonParseException;
import java.io.IOException;
import javax.ws.rs.core.Response;
import junit.framework.TestCase;
import no.deichman.services.resources.Work;
import org.codehaus.jackson.JsonParser;
import org.codehaus.jackson.map.ObjectMapper;
import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;

/**
 *
 * @author sbd
 */
public class WorkTest extends TestCase {

    public WorkTest(String testName) {
        super(testName);
    }

    @BeforeClass
    public static void setUpClass() throws Exception {
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
     * Test of listWork method, of class Work.
     */
    public void testListWork() {
        System.out.println("listWork");
        Work instance = new Work();
        Response expResult = null;
        Response result = instance.listWork();
        assertNotNull(result);
        assertEquals(200, result.getStatus());
        assertTrue(isValidJSON(result.getEntity().toString()));
    }

    /**
     * Test of getWork method, of class Work.
     */
    @Test
    public void testGetWork() {
        System.out.println("getWork");
        String workId = "1";
        Work instance = new Work();
        Response result = instance.getWork(workId);
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

}
