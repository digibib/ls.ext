package no.deichman.services.search;

import no.deichman.services.entity.ResourceBase;
import no.deichman.services.uridefaults.XURI;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Singleton;
import javax.servlet.ServletConfig;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.MultivaluedMap;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriInfo;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ForkJoinPool;

import static org.apache.commons.lang3.StringUtils.isBlank;

/**
 * Responsibility: Expose a subset of Elasticsearch REST API limited to searching for works.
 */
@Singleton
@Path("search")
public class SearchResource extends ResourceBase {
    public static final String ALL_EXCEPT_LAST_PATH_ELEMENT = "^.+/";
    private static final Logger LOG = LoggerFactory.getLogger(SearchResource.class);
    @Context
    private ServletConfig servletConfig;

    public SearchResource() {
    }

    public SearchResource(SearchService searchService) {
        setSearchService(searchService);
    }

    @GET
    @Path("{type: work|person|placeOfPublication}/_search")
    @Produces(MediaType.APPLICATION_JSON)
    public final Response search(@PathParam("type") String type, @QueryParam("q") String query) {
        if (isBlank(query)) {
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
        switch (type) {
            case "work":
                return getSearchService().searchWork(query);
            case "person":
                return getSearchService().searchPerson(query);
            case "placeOfPublication":
                return getSearchService().searchPlaceOfPublication(query);
            case "publisher":
                return getSearchService().searchPublisher(query);
            default:
                throw new RuntimeException("Unknown type: " + type);
        }
    }

    @POST
    @Path("{type: work|person|placeOfPublication}/_search")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public final Response searchJson(String body, @PathParam("type") String type, @Context UriInfo uriInfo) {
        if (isBlank(body)) {
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
        MultivaluedMap<String, String> queryParams = uriInfo.getQueryParameters();
        switch (type) {
            case "work":
                return getSearchService().searchWorkWithJson(body, queryParams);
            case "person":
                return getSearchService().searchPersonWithJson(body);
            case "placeOfPublication":
                return getSearchService().searchPlaceOfPublication(body);
            default:
                throw new RuntimeException("Unknown type: " + type);
        }
    }

    @POST
    @Path("clear_index")
    public final Response clearIndex() {
        return getSearchService().clearIndex();
    }

    @POST
    @Path("{type: work|person}/reindex_all")
    public final Response reIndex(@PathParam("type") final String type) {
        ForkJoinPool.commonPool().execute(new Runnable() {
            @Override
            public void run() {
                LOG.info("Starting to reindex " + type);
                long start = System.currentTimeMillis();
                getEntityService().retrieveAllWorkUris(type, uri -> CompletableFuture.runAsync(() -> {
                    if (type.equals("person")) {
                        try {
                            getSearchService().indexPerson(new XURI(uri));
                        } catch (Exception e) {
                            e.printStackTrace();
                        }
                    } else {
                        try {
                            getSearchService().indexWork(new XURI(uri));
                        } catch (Exception e) {
                            e.printStackTrace();
                        }
                    }
                }));
                LOG.info("Done reindexing " + type + " in " + (System.currentTimeMillis() - start) + " seconds");
            }
        });
        return Response.accepted().build();
    }

    private String idFromUri(String uri) {
        return uri.replaceAll(ALL_EXCEPT_LAST_PATH_ELEMENT, "");
    }

    @Override
    protected final ServletConfig getConfig() {
        return servletConfig;
    }
}
