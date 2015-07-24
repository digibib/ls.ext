package no.deichman.services.rest.utils;

import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.ResponseBuilder;

/**
 * Responsibility: TODO.
 */
public class CORSProvider {

    public final Response makeCORSResponse(ResponseBuilder resp, String returnMethod) {
        ResponseBuilder rb = resp
                .header("Access-Control-Allow-Origin", "*")
                .header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH");

        if (!"".equals(returnMethod)) {
           rb.header("Access-Control-Allow-Headers", returnMethod);
        }

        return rb.build();
     }

}
