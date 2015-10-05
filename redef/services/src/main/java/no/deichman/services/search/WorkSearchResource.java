package no.deichman.services.search;

import no.deichman.services.entity.ResourceBase;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.http.Header;
import org.apache.http.HttpEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.utils.URIBuilder;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.annotation.PostConstruct;
import javax.inject.Singleton;
import javax.servlet.ServletConfig;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.io.IOException;
import java.net.URISyntaxException;

/**
 * Responsibility: Expose a subset of Elasticsearch REST API limited to searching for works.
 */
@Singleton
@Path("search/work")
public class WorkSearchResource extends ResourceBase {
    private static final Logger LOG = LoggerFactory.getLogger(WorkSearchResource.class);
    private URIBuilder workSearchUriBuilder;

    @Context
    private ServletConfig servletConfig;

    @PostConstruct
    public final void init() {
        try {
            workSearchUriBuilder = new URIBuilder(elasticSearchBaseUrl()).setPath("/search/work/_search");
        } catch (URISyntaxException e) {
            LOG.error(e.getMessage(), e);
        }
    }

    @GET
    @Path("_search")
    @Produces(MediaType.APPLICATION_JSON)
    public final Response search(@QueryParam("q") String query) {
        if (StringUtils.isBlank(query)) {
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
        try (CloseableHttpClient httpclient = HttpClients.createDefault()) {
            HttpGet httpget = new HttpGet(workSearchUriBuilder.setParameter("q", query).build());
            try (CloseableHttpResponse response = httpclient.execute(httpget)) {
                HttpEntity responseEntity = response.getEntity();
                String jsonContent = IOUtils.toString(responseEntity.getContent());
                Response.ResponseBuilder responseBuilder = Response.ok(jsonContent);
                Header[] headers = response.getAllHeaders();
                for (Header header : headers) {
                    responseBuilder = responseBuilder.header(header.getName(), header.getValue());
                }
                return responseBuilder.build();
            }
        } catch (IOException e) {
            LOG.error(e.getMessage(), e);
            return Response.serverError().build();
        } catch (URISyntaxException usx) {
            LOG.error(usx.getMessage(), usx);
            return Response.serverError().build();
        }
    }

    @Override
    protected final ServletConfig getConfig() {
        return servletConfig;
    }
}
