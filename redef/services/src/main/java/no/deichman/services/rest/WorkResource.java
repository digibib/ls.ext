package no.deichman.services.rest;

import com.hp.hpl.jena.rdf.model.Model;
import java.net.URI;
import java.net.URISyntaxException;
import javax.inject.Singleton;
import javax.servlet.ServletConfig;
import javax.ws.rs.BadRequestException;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.NotFoundException;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.Response;
import no.deichman.services.rest.utils.PATCH;
import no.deichman.services.service.EntityService;
import no.deichman.services.uridefaults.BaseURI;

import static no.deichman.services.rest.utils.MimeType.JSONLD;
import static no.deichman.services.rest.utils.MimeType.LDPATCHJSON;

/**
 * Responsibility: Expose Work as a r/w REST resource.
 */
@Singleton
@Path("/work")
public final class WorkResource extends ResourceBase {
    private static final String MIME_JSONLD = JSONLD;
    private static final String ENCODING_UTF8 = "; charset=utf-8";
    private static final String MIME_LDPATCH_JSON = LDPATCHJSON;

    @Context private ServletConfig servletConfig;

    public WorkResource() {
    }

    WorkResource(BaseURI baseURI, EntityService entityService) {
        setBaseURI(baseURI);
        setEntityService(entityService);
    }

    @POST
    @Consumes(MIME_JSONLD)
    public Response createWork(String work) throws URISyntaxException {
        String workId = getEntityService().createWork(work);
        URI location = new URI(workId);

        return Response.created(location).build();
    }

    @PUT
    @Consumes(MIME_JSONLD)
    public Response updateWork(String work) {
        getEntityService().updateWork(work);
        return Response.ok().build();
    }

    @PATCH
    @Path("/{workId: [a-zA-Z0-9_]+}")
    @Consumes(MIME_LDPATCH_JSON)
    public Response patchWork(@PathParam("workId") String workId, String requestBody) {
        if (!getEntityService().resourceExists(getBaseURI().work() + workId)) {
            throw new NotFoundException();
        }
        Model m;
        try {
            m = getEntityService().patchWork(workId, requestBody);
        } catch (Exception e) {
            throw new BadRequestException(e); // FIXME - swallows root cause
        }

        return Response.ok().entity(getJsonldCreator().asJSONLD(m)).build();
    }

    @GET
    @Path("/{workId: [a-zA-Z0-9_]+}")
    @Produces(MIME_JSONLD + ENCODING_UTF8)
    public Response getWorkJSON(@PathParam("workId") String workId) {
        Model model = getEntityService().retrieveWorkById(workId);

        if (model.isEmpty()) {
            throw new NotFoundException();
        }

        return Response.ok().entity(getJsonldCreator().asJSONLD(model)).build();
    }

    @DELETE
    @Path("/{workId: [a-zA-Z0-9_]+}")
    public Response deleteWork(@PathParam("workId") String workId) {
        Model model = getEntityService().retrieveWorkById(workId);

        if (model.isEmpty()) {
            throw new NotFoundException();
        }

        getEntityService().deleteWork(model);

        return Response.noContent().build();
    }

    @GET
    @Path("/{workId: [a-zA-Z0-9_]+}/items")
    @Produces(MIME_JSONLD + ENCODING_UTF8)
    public Response getWorkItems(@PathParam("workId") String workId) {
        Model model = getEntityService().retrieveWorkItemsById(workId);
        if (model.isEmpty()) {
            throw new NotFoundException();
        }

        return Response.ok().entity(getJsonldCreator().asJSONLD(model)).build();
    }

    @Override
    ServletConfig getConfig() {
        return servletConfig;
    }
}
