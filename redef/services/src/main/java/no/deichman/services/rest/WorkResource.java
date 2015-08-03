package no.deichman.services.rest;

import com.hp.hpl.jena.rdf.model.Model;
import java.net.URI;
import java.net.URISyntaxException;
import javax.ws.rs.BadRequestException;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.HeaderParam;
import javax.ws.rs.NotFoundException;
import javax.ws.rs.OPTIONS;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Response;
import no.deichman.services.kohaadapter.KohaAdapterImpl;
import no.deichman.services.repository.RepositoryDefault;
import no.deichman.services.rest.utils.CORSProvider;
import no.deichman.services.rest.utils.JSONLDCreator;
import static no.deichman.services.rest.utils.MimeType.JSONLD;
import static no.deichman.services.rest.utils.MimeType.LDPATCHJSON;
import no.deichman.services.rest.utils.PATCH;
import no.deichman.services.service.Service;
import no.deichman.services.service.ServiceImpl;
import no.deichman.services.uridefaults.BaseURI;
import no.deichman.services.uridefaults.BaseURIDefault;

/**
 * Responsibility: Expose Work as a r/w REST resource.
 */
@Path("/work")
public final class WorkResource {
    private static final String MIME_JSONLD = JSONLD;
    private static final String ENCODING_UTF8 = "; charset=utf-8";
    private static final String MIME_LDPATCH_JSON = LDPATCHJSON;

    private final Service service;
    private final BaseURI baseURI;
    private final JSONLDCreator jsonldCreator;
    private final CORSProvider cors;

    public WorkResource() {
        this(new BaseURIDefault(), new ServiceImpl(new BaseURIDefault(), new RepositoryDefault(), new KohaAdapterImpl()));
    }

    public WorkResource(BaseURI baseURI, Service service) {
        this.baseURI = baseURI;
        this.service = service;
        jsonldCreator = new JSONLDCreator(baseURI);
        cors = new CORSProvider();
    }

    @POST
    @Consumes(MIME_JSONLD)
    public Response createWork(String work) throws URISyntaxException {
        String workId = service.createWork(work);
        URI location = new URI(workId);

        return Response.created(location)
                       .header("Access-Control-Allow-Origin", "*")
                       .header("Access-Control-Allow-Methods", "POST")
                       .header("Access-Control-Expose-Headers", "Location")
                       .allow("OPTIONS")
                       .build();
    }

    @PUT
    @Consumes(MIME_JSONLD)
    public Response updateWork(String work) {
        service.updateWork(work);
        return Response.ok()
                       .header("Access-Control-Allow-Origin", "*")
                       .header("Access-Control-Allow-Methods", "PUT")
                       .allow("OPTIONS")
                       .build();
    }

    @PATCH
    @Path("/{workId: [a-zA-Z0-9_]+}")
    @Consumes(MIME_LDPATCH_JSON)
    public Response patchWork(@PathParam("workId") String workId, String requestBody) throws Exception {
        if (!service.resourceExists(baseURI.getWorkURI() + workId)) {
            throw new NotFoundException();
        }
        Model m;
        try {
             m = service.patchWork(workId, requestBody);
        } catch (Exception e) {
            throw new BadRequestException(e); // FIXME - swallows root cause
        }

        return Response.ok().entity(jsonldCreator.asJSONLD(m))
                       .header("Access-Control-Allow-Origin", "*")
                       .header("Access-Control-Allow-Methods", "PATCH")
                       .allow("OPTIONS")
                       .build();
    }

    @GET
    @Path("/{workId: [a-zA-Z0-9_]+}")
    @Produces(MIME_JSONLD + ENCODING_UTF8)
    public Response getWorkJSON(@PathParam("workId") String workId) {
        Model model = service.retrieveWorkById(workId);

        if (model.isEmpty()) {
            throw new NotFoundException();
        }

        return Response.ok().entity(jsonldCreator.asJSONLD(model))
                            .header("Access-Control-Allow-Origin", "*")
                            .header("Access-Control-Allow-Methods", "GET")
                            .allow("OPTIONS")
                            .build();
    }

    @OPTIONS
    public Response corsWorkBase(@HeaderParam("Access-Control-Request-Headers") String reqHeader) {
        return cors.makeCORSResponse(Response.ok().allow("POST"), reqHeader);
    }

    @DELETE
    @Path("/{workId: [a-zA-Z0-9_]+}")
    public Response deleteWork(@PathParam("workId") String workId) {
        Model model = service.retrieveWorkById(workId);

        if (model.isEmpty()) {
            throw new NotFoundException();
        }

        service.deleteWork(model);

        return Response.noContent().header("Access-Control-Allow-Origin", "*")
                                   .header("Access-Control-Allow-Methods", "GET")
                                   .allow("OPTIONS")
                                   .build();
    }

    @OPTIONS
    @Path("/{workId: [a-zA-Z0-9_]+}")
    public Response corsWorkId(@HeaderParam("Access-Control-Request-Headers") String reqHeader) {
        return cors.makeCORSResponse(Response.ok().allow("GET, PATCH, DELETE"), reqHeader);
    }

    @GET
    @Path("/{workId: [a-zA-Z0-9_]+}/items")
    @Produces(MIME_JSONLD + ENCODING_UTF8)
    public Response getWorkItems(@PathParam("workId") String workId) {
        Model model = service.retrieveWorkItemsById(workId);
        if (model.isEmpty()) {
            throw new NotFoundException();
        }

        return Response.ok().entity(jsonldCreator.asJSONLD(model))
                            .header("Access-Control-Allow-Origin", "*")
                            .header("Access-Control-Allow-Methods", "GET")
                            .allow("OPTIONS")
                            .build();
    }
}
