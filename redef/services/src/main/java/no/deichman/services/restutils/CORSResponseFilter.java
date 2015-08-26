package no.deichman.services.restutils;

import java.io.IOException;
import javax.annotation.Priority;
import javax.ws.rs.Priorities;
import javax.ws.rs.container.ContainerRequestContext;
import javax.ws.rs.container.ContainerResponseContext;
import javax.ws.rs.container.ContainerResponseFilter;
import javax.ws.rs.core.MultivaluedMap;
import javax.ws.rs.core.Response;
import static javax.ws.rs.core.Response.Status.CREATED;

/**
 * Responsibility: Provide CORS-relevant headers.
 */
@Priority(Priorities.HEADER_DECORATOR)
public final class CORSResponseFilter implements ContainerResponseFilter {

    static final String OPTIONS_METHOD = "OPTIONS";

    static final String ORIGIN_HEADER_KEY = "Origin";

    static final String ALLOW_HEADER = "Allow";
    static final String LOCATION_HEADER_KEY = "Location";

    static final String AC_EXPOSE_HEADERS = "Access-Control-Expose-Headers";

    static final String AC_REQUEST_HEADERS = "Access-Control-Request-Headers";
    static final String AC_REQUEST_METHOD = "Access-Control-Request-Method";

    static final String AC_ALLOW_ORIGIN = "Access-Control-Allow-Origin";
    static final String AC_ALLOW_METHODS = "Access-Control-Allow-Methods";
    static final String AC_ALLOW_HEADERS = "Access-Control-Allow-Headers";


    /**
     * Somewhat inspired by http://www.html5rocks.com/static/images/cors_server_flowchart.png.
     */
    @Override
    public void filter(ContainerRequestContext reqCtx, ContainerResponseContext respCtx) throws IOException {

        if(!reqCtx.getHeaders().containsKey(ORIGIN_HEADER_KEY)) {
            return;
        }

        final MultivaluedMap<String, Object> respHeaders = respCtx.getHeaders();
        if(isPreflightRequest(reqCtx.getMethod(), reqCtx.getHeaders())) {
            // TODO what to do if the request method is not allowed?
            // final Object requestMethod = respHeaders.getFirst(AC_REQUEST_METHOD);

            // All Allow:-methods are allowed with CORS
            if (respHeaders.containsKey(ALLOW_HEADER)) {
                respHeaders.putSingle(AC_ALLOW_METHODS, respHeaders.getFirst(ALLOW_HEADER));
            } else {
                reqCtx.abortWith(
                        Response
                                .serverError()
                                .entity("Error in CORSResponseFilter: CORS-preflight request on OPTIONS-request without Allow:-header")
                                .build());
            }

            // We'll allow all requested headers
            respHeaders.putSingle(AC_ALLOW_HEADERS, reqCtx.getHeaders().getFirst(AC_REQUEST_HEADERS));

        } else { // Actual request
            if (CREATED.equals(respCtx.getStatusInfo())) {
                respHeaders.putSingle(AC_EXPOSE_HEADERS, LOCATION_HEADER_KEY);
            }
            // TODO figure out what other headers we would like to expose
        }

        respCtx.getHeaders().putSingle(AC_ALLOW_ORIGIN, "*");
    }

    private boolean isPreflightRequest(String method, MultivaluedMap<String, String> reqHeaders) {
        return OPTIONS_METHOD.equals(method) && reqHeaders.containsKey(AC_REQUEST_METHOD);
    }

}
