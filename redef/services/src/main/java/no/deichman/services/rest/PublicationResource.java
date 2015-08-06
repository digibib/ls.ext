package no.deichman.services.rest;

import com.hp.hpl.jena.rdf.model.Model;
import java.net.URI;
import javax.ws.rs.BadRequestException;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.NotFoundException;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Response;
import no.deichman.services.patch.PatchParserException;
import no.deichman.services.kohaadapter.KohaAdapterImpl;
import no.deichman.services.repository.RemoteRepository;
import no.deichman.services.rest.utils.JSONLDCreator;
import no.deichman.services.rest.utils.MimeType;
import no.deichman.services.rest.utils.PATCH;
import no.deichman.services.service.Service;
import no.deichman.services.service.ServiceImpl;
import no.deichman.services.uridefaults.BaseURI;

/**
 * Responsibility: Expose publication as a r/w REST resource.
 */
@Path("/publication")
public final class PublicationResource {

    private static final String MIME_JSONLD = MimeType.JSONLD;
    private static final String ENCODING_UTF8 = "; charset=utf-8";

    private final Service service;
    private final BaseURI baseURI;
    private final JSONLDCreator jsonldCreator;

    public PublicationResource() {
        this(BaseURI.remote(), new ServiceImpl(BaseURI.remote(), new RemoteRepository(), new KohaAdapterImpl()));
    }

    public PublicationResource(BaseURI baseURI, Service service) {
        this.service = service;
        this.baseURI = baseURI;
        jsonldCreator = new JSONLDCreator(baseURI);
    }

    @POST
    @Consumes(MIME_JSONLD)
    public Response createPublication(String publication) throws Exception {
        String publicationId = service.createPublication(publication);
        URI location = new URI(publicationId);

        return Response.created(location).build();
    }

    @GET
    @Path("/{publicationId: [a-zA-Z0-9_]+}")
    @Produces(MIME_JSONLD + ENCODING_UTF8)
    public Response getPublicationJSON(@PathParam("publicationId") String publicationId) {
        Model model = service.retrievePublicationById(publicationId);

        if (model.isEmpty()) {
            throw new NotFoundException();
        }

        return Response.ok().entity(jsonldCreator.asJSONLD(model)).build();
    }

    @DELETE
    @Path("/{publicationId: [a-zA-Z0-9_]+}")
    public Response deletePublication(@PathParam("publicationId") String publicationId) {
        Model model = service.retrievePublicationById(publicationId);

        if (model.isEmpty()) {
            throw new NotFoundException();
        }

        service.deletePublication(model);

        return Response.noContent().build();
    }

    @PATCH
    @Path("/{publicationId: [a-zA-Z0-9_]+}")
    @Consumes(MimeType.LDPATCHJSON)
    public Response patchPublication(@PathParam("publicationId") String publicationId, String requestBody) throws Exception {
        if (!service.resourceExists(baseURI.publication() + publicationId)) {
            throw new NotFoundException();
        }
        Model m;
        try {
             m = service.patchPublication(publicationId, requestBody);
        } catch (PatchParserException e) {
            throw new BadRequestException(e);
        }

        return Response.ok().entity(jsonldCreator.asJSONLD(m)).build();
    }

}
