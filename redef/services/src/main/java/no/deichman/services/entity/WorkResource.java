package no.deichman.services.entity;

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
import no.deichman.services.restutils.PATCH;
import no.deichman.services.uridefaults.BaseURI;

import static no.deichman.services.restutils.MimeType.UTF_8;
import static no.deichman.services.restutils.MimeType.LDPATCH_JSON;
import static no.deichman.services.restutils.MimeType.LD_JSON;

/**
 * Responsibility: Expose Work as a r/w REST resource.
 */
@Singleton
@Path("/work")
public final class WorkResource extends ResourceBase {

    @Context private ServletConfig servletConfig;

    public WorkResource() {
    }

    WorkResource(BaseURI baseURI, EntityService entityService) {
        setBaseURI(baseURI);
        setEntityService(entityService);
    }

    @POST
    @Consumes(LD_JSON)
    public Response createWork(String work) throws URISyntaxException {
        String workId = getEntityService().createWork(work);
        URI location = new URI(workId);

        return Response.created(location).build();
    }

    @PUT
    @Consumes(LD_JSON)
    public Response updateWork(String work) {
        getEntityService().updateWork(work);
        return Response.ok().build();
    }

    @PATCH
    @Path("/{workId: [a-zA-Z0-9_]+}")
    @Consumes(LDPATCH_JSON)
    @Produces(LD_JSON + UTF_8)
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
    @Produces(LD_JSON + UTF_8)
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
    @Produces(LD_JSON + UTF_8)
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
