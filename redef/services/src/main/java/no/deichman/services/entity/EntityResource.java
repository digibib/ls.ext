package no.deichman.services.entity;

import org.apache.jena.rdf.model.Model;
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
import no.deichman.services.entity.patch.PatchParserException;
import no.deichman.services.restutils.PATCH;
import no.deichman.services.uridefaults.BaseURI;

import static no.deichman.services.restutils.MimeType.LDPATCH_JSON;
import static no.deichman.services.restutils.MimeType.LD_JSON;
import static no.deichman.services.restutils.MimeType.UTF_8;

/**
 * Responsibility: Expose entitites as r/w REST resources.
 */
@Singleton
@Path("/{type: " + EntityType.ALL_TYPES_PATTERN + " }")
public final class EntityResource extends ResourceBase {

    @Context private ServletConfig servletConfig;

    public EntityResource() {
    }

    EntityResource(BaseURI baseURI, EntityService entityService) {
        setBaseURI(baseURI);
        setEntityService(entityService);
    }

    @POST
    @Consumes(LD_JSON)
    public Response create(@PathParam("type") String type, String jsonLd) throws URISyntaxException {
        String id = getEntityService().create(EntityType.get(type), jsonLd);
        return Response.created(new URI(id)).build();
    }

    @GET
    @Path("/{id: [a-zA-Z0-9_]+}")
    @Produces(LD_JSON + UTF_8)
    public Response get(@PathParam("type") String type, @PathParam("id") String id) {
        Model model = getEntityService().retrieveById(EntityType.get(type), id);
        if (model.isEmpty()) {
            throw new NotFoundException();
        }
        return Response.ok().entity(getJsonldCreator().asJSONLD(model)).build();
    }

    @DELETE
    @Path("/{id: [a-zA-Z0-9_]+}")
    public Response delete(@PathParam("type") String type, @PathParam("id") String id) {
        Model model = getEntityService().retrieveById(EntityType.get(type), id);
        if (model.isEmpty()) {
            throw new NotFoundException();
        }
        getEntityService().delete(model);
        return Response.noContent().build();
    }

    @PATCH
    @Path("/{id: [a-zA-Z0-9_]+}")
    @Consumes(LDPATCH_JSON)
    @Produces(LD_JSON + UTF_8)
    public Response patch(@PathParam("type") String type, @PathParam("id") String id, String jsonLd) throws Exception {
        EntityType entityType = EntityType.get(type);
        String resourceUri;
        switch (entityType) {
            case WORK: resourceUri = getBaseURI().work() + id; break;
            case PUBLICATION: resourceUri = getBaseURI().publication() + id; break;
            default: throw new NotFoundException("Unknown entity type.");
        }

        if (!getEntityService().resourceExists(resourceUri)) {
            throw new NotFoundException();
        }
        Model m;
        try {
            m = getEntityService().patch(entityType, id, jsonLd);
        } catch (PatchParserException e) {
            throw new BadRequestException(e);
        }

        return Response.ok().entity(getJsonldCreator().asJSONLD(m)).build();
    }

    @PUT
    @Consumes(LD_JSON)
    public Response update(@PathParam("type") String type, String work) {
        EntityType entityType = EntityType.get(type);
        if (entityType != EntityType.WORK) {
            throw new NotFoundException("PUT unsupported on this resource");
        }
        getEntityService().updateWork(work);
        return Response.ok().build();
    }

    @GET
    @Path("/{workId: [a-zA-Z0-9_]+}/items")
    @Produces(LD_JSON + UTF_8)
    public Response getWorkItems(@PathParam("workId") String workId, @PathParam("type") String type) {
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
