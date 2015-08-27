package no.deichman.services.entity;

import com.hp.hpl.jena.rdf.model.Model;
import java.net.URI;
import javax.inject.Singleton;
import javax.servlet.ServletConfig;
import javax.ws.rs.BadRequestException;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.NotFoundException;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.Response;
import no.deichman.services.entity.patch.PatchParserException;
import no.deichman.services.restutils.MimeType;
import no.deichman.services.restutils.PATCH;
import no.deichman.services.uridefaults.BaseURI;

import static no.deichman.services.restutils.MimeType.LDPATCH_JSON;
import static no.deichman.services.restutils.MimeType.LD_JSON;

/**
 * Responsibility: Expose publication as a r/w REST resource.
 */
@Singleton
@Path("/publication")
public final class PublicationResource extends ResourceBase {

    @Context private ServletConfig servletConfig;

    public PublicationResource() { }

    PublicationResource(BaseURI baseURI, EntityService entityService) {
        setEntityService(entityService);
        setBaseURI(baseURI);
    }

    @POST
    @Consumes(LD_JSON)
    public Response createPublication(String publication) throws Exception {
        String publicationId = getEntityService().createPublication(publication);
        URI location = new URI(publicationId);

        return Response.created(location).build();
    }

    @GET
    @Path("/{publicationId: [a-zA-Z0-9_]+}")
    @Produces(LD_JSON + MimeType.UTF_8)
    public Response getPublicationJSON(@PathParam("publicationId") String publicationId) {
        Model model = getEntityService().retrievePublicationById(publicationId);

        if (model.isEmpty()) {
            throw new NotFoundException();
        }

        return Response.ok().entity(getJsonldCreator().asJSONLD(model)).build();
    }

    @DELETE
    @Path("/{publicationId: [a-zA-Z0-9_]+}")
    public Response deletePublication(@PathParam("publicationId") String publicationId) {
        Model model = getEntityService().retrievePublicationById(publicationId);

        if (model.isEmpty()) {
            throw new NotFoundException();
        }

        getEntityService().deletePublication(model);

        return Response.noContent().build();
    }

    @PATCH
    @Path("/{publicationId: [a-zA-Z0-9_]+}")
    @Consumes(LDPATCH_JSON)
    public Response patchPublication(@PathParam("publicationId") String publicationId, String requestBody) throws Exception {
        if (!getEntityService().resourceExists(getBaseURI().publication() + publicationId)) {
            throw new NotFoundException();
        }
        Model m;
        try {
             m = getEntityService().patchPublication(publicationId, requestBody);
        } catch (PatchParserException e) {
            throw new BadRequestException(e);
        }

        return Response.ok().entity(getJsonldCreator().asJSONLD(m)).build();
    }

    @Override
    ServletConfig getConfig() {
        return servletConfig;
    }
}
