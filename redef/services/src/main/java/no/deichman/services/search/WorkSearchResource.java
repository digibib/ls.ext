package no.deichman.services.search;

import java.io.IOException;

import javax.inject.Singleton;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.apache.commons.lang3.StringUtils;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;

/**
 * Responsibility: Offer a REST service for searcing for works
 */
@Singleton
@Path("work")
public class WorkSearchResource {
    @GET
    @Path("_search")
    @Produces(MediaType.APPLICATION_JSON)
    public Response search(@QueryParam("q") String query) {
        if (StringUtils.isBlank(query)) {
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
        try (CloseableHttpClient httpclient = HttpClients.createDefault()) {
            HttpGet httpget = new HttpGet("http://localhost:9200/work/_search?q=" + query);
            try (CloseableHttpResponse response = httpclient.execute(httpget)) {
                return Response.ok(response.getEntity()).build();
            } catch (Exception e) {
                e.printStackTrace();
                return Response.serverError().build();
            }
        } catch (IOException e) {
            return Response.serverError().build();
        }
    }
}
