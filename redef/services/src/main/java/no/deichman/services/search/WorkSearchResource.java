package no.deichman.services.search;

import no.deichman.services.entity.ResourceBase;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Singleton;
import javax.servlet.ServletConfig;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

/**
 * Responsibility: Expose a subset of Elasticsearch REST API limited to searching for works.
 */
@Singleton
@Path("search/work")
public class WorkSearchResource extends ResourceBase {
    private static final Logger LOG = LoggerFactory.getLogger(WorkSearchResource.class);


    @Context
    private ServletConfig servletConfig;

    @GET
    @Path("_search")
    @Produces(MediaType.APPLICATION_JSON)
    public final Response search(@QueryParam("q") String query) {
        if (StringUtils.isBlank(query)) {
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
        return getSearchService().search(query);
    }


    @Override
    protected final ServletConfig getConfig() {
        return servletConfig;
    }
}
