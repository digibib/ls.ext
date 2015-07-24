package no.deichman.services.rest.utils;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;

import javax.ws.rs.core.Response;

import org.junit.Test;

public final class CORSProviderTest {

    @Test
    public void test_it_exists(){
        assertNotNull(new CORSProvider());
    }

    @Test
    public void test_it_can_make_CORS_response(){
        CORSProvider cors = new CORSProvider();
        String reqHeader = "";
        Response response = cors.makeCORSResponse(Response.ok(), reqHeader);
        assertNotNull(response);
        assertNull(response.getHeaderString("Access-Control-Allow-Headers"));
        assertEquals(response.getHeaderString("Access-Control-Allow-Origin"), "*");
        assertEquals(response.getHeaderString("Access-Control-Allow-Methods"), "GET, POST, OPTIONS, PUT, PATCH");
    }
}
