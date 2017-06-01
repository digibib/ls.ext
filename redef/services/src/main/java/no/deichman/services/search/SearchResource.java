package no.deichman.services.search;

import no.deichman.services.entity.ResourceBase;
import no.deichman.services.uridefaults.XURI;
import org.glassfish.hk2.api.Immediate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.ServletConfig;
import javax.ws.rs.BadRequestException;
import javax.ws.rs.Consumes;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.FormParam;
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

import static no.deichman.services.entity.EntityType.ALL_TYPES_PATTERN;
import static org.apache.commons.lang3.StringUtils.isBlank;

/**
 * Responsibility: Expose a subset of Elasticsearch REST API limited to searching for works, as well as providing
 * routes to trigger reindexing of resources.
 */
@Immediate
@Path("search")
public class SearchResource extends ResourceBase {
    private static final Logger LOG = LoggerFactory.getLogger(SearchResource.class);

    @Context
    private ServletConfig servletConfig;

    public SearchResource() {
        if (System.getenv("GITREF") != null) {
            // We don't want this to execute when running tests, hence the check for environment
            // variable which is only present in production.
            new Thread(() -> {
                // This will trigger the initialization of the in-memory authorized lists
                getSearchService();
            }).start();
        }
    }

    public SearchResource(SearchService searchService) {
        setSearchService(searchService);
    }


    @GET
    @Path("{type: "+ ALL_TYPES_PATTERN + "}/sorted_list")
    public final Response sortedList(@PathParam("type") String type,
                                     @QueryParam("prefix") String prefix,
                                     @DefaultValue("100") @QueryParam("minSize") int minSize,
                                     @DefaultValue("name") @QueryParam("field") String field) {
        return getSearchService().sortedList(type, prefix, minSize, field);
    }


    @GET
    @Path("{type: "+ ALL_TYPES_PATTERN + "}/_search")
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
            case "place":
                return getSearchService().searchPlace(query);
            case "corporation":
                return getSearchService().searchCorporation(query);
            case "serial":
                return getSearchService().searchSerial(query);
            case "workSeries":
                return getSearchService().searchWorkSeries(query);
            case "subject":
                return getSearchService().searchSubject(query);
            case "genre":
                return getSearchService().searchGenre(query);
            case "publication":
                return getSearchService().searchPublication(query);
            case "instrument":
                return getSearchService().searchInstrument(query);
            case "compositionType":
                return getSearchService().searchCompositionType(query);
            case "event":
                return getSearchService().searchEvent(query);
            default:
                throw new RuntimeException("Unknown type: " + type);
        }
    }

    @POST
    @Path("{type: " + ALL_TYPES_PATTERN + "}/_search")
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
            case "place":
                return getSearchService().searchPlace(body);
            case "corporation":
                return getSearchService().searchCorporation(body);
            case "serial":
                return getSearchService().searchSerial(body);
            case "subject":
                return getSearchService().searchSubject(body);
            case "genre":
                return getSearchService().searchGenre(body);
            case "publication":
                return getSearchService().searchPublicationWithJson(body);
            default:
                throw new RuntimeException("Unknown type: " + type);
        }
    }

    @POST
    @Path("clear_index")
    public final Response clearIndex() {
        return getBootstrapSearchService().clearIndex();
    }


    @POST
    @Path("reindex_all")
    public final Response reIndexAll() throws Exception {
        LOG.info("Starting to reindex all types");

        getSearchService().enqueueIndexingAllResources();

        return Response.accepted().build();
    }

    @POST
    @Path("{type: "+ ALL_TYPES_PATTERN + "}/reindex_all")
    public final Response reIndex(
            @PathParam("type") final String type,
            @QueryParam("ignoreConnectedResources") boolean ignoreConnectedResources) {

        getSearchService().enqueueIndexingAllOfType(type, ignoreConnectedResources);

        return Response.accepted().build();
    }


    @POST
    @Path("publication/reindex")
    public final Response reIndexPublicationByRecordId(
            @FormParam("recordId") final String recordId,
            @FormParam("homeBranches") final String homeBranches,
            @FormParam("availableBranches") final String availableBranches,
            @FormParam("numItems") final int numItems) throws Exception {

        if (recordId == null) {
            throw new BadRequestException("missing required queryparameter: recordId");
        }

        XURI pubUri = getEntityService().
                updateAvailabilityData(recordId, homeBranches, availableBranches, numItems);

        try {
            getSearchService().indexOnly(pubUri, false);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return Response.accepted().build();
    }

    @POST
    @Path("indexUrisOnlyOnce")
    public final Response indexUrisOnlyOnce(){
        getSearchService().indexUrisOnlyOnce(true);
        return Response.accepted().build();
    }

    @POST
    @Path("indexAllUris")
    public final Response indexAllUris(){
        getSearchService().indexUrisOnlyOnce(false);
        return Response.accepted().build();
    }

    @Override
    protected final ServletConfig getConfig() {
        return servletConfig;
    }
}
