package no.deichman.services.resources;

import com.hp.hpl.jena.rdf.model.Model;

import no.deichman.services.kohaadapter.KohaAdapter;
import no.deichman.services.repository.Repository;
import no.deichman.services.service.Service;
import no.deichman.services.service.ServiceDefault;
import no.deichman.services.uridefaults.BaseURI;
import no.deichman.services.uridefaults.BaseURIDefault;
import no.deichman.services.utils.JSONLD;
import no.deichman.services.utils.MimeType;
import no.deichman.services.utils.PATCH;

import javax.ws.rs.BadRequestException;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.HeaderParam;
import javax.ws.rs.NotFoundException;
import javax.ws.rs.OPTIONS;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.DELETE;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.ResponseBuilder;

import java.net.URI;
import java.net.URISyntaxException;

@Path("/work")
public class WorkResource {
    private static final String MIME_JSONLD = MimeType.JSONLD;
    private static final String ENCODING_UTF8 = "; charset=utf-8";
    private static final String MIME_LDPATCH_JSON = MimeType.LDPATCHJSON;

    private Response makeCORS(ResponseBuilder resp, String returnMethod) {
       ResponseBuilder rb = resp
               .header("Access-Control-Allow-Origin", "*")
               .header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH");

       if (!"".equals(returnMethod)) {
          rb.header("Access-Control-Allow-Headers", returnMethod);
       }

       return rb.build();
    }

    private final Service service;
    private BaseURI baseURI;
    private JSONLD jsonld;

    public WorkResource() {
        super();
        baseURI = new BaseURIDefault();
        jsonld = new JSONLD(baseURI);
        service = new ServiceDefault(baseURI);
    }

    public WorkResource(KohaAdapter kohaAdapter, Repository repository, BaseURI b) {
        super();
        ServiceDefault serviceDefault = new ServiceDefault(b);
        serviceDefault.setKohaAdapter(kohaAdapter);
        serviceDefault.setRepository(repository);
        service = serviceDefault;
        baseURI = b;
        jsonld = new JSONLD(b);
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
        if ( !service.getRepository().askIfResourceExists(baseURI.getWorkURI() + workId) ) {
            throw new NotFoundException();
        }
        Model m;
        try {
             m = service.patchWork(workId, requestBody);
        } catch (Exception e) {
            throw new BadRequestException();
        }

        return Response.ok().entity(jsonld.getJson(m))
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

        return Response.ok().entity(jsonld.getJson(model))
                            .header("Access-Control-Allow-Origin", "*")
                            .header("Access-Control-Allow-Methods", "GET")
                            .allow("OPTIONS")
                            .build();
    }

    @OPTIONS
    public Response corsWorkBase(@HeaderParam("Access-Control-Request-Headers") String reqHeader) {
        return makeCORS(Response.ok(), reqHeader);
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
        return makeCORS(Response.ok(), reqHeader);
    }

    @GET
    @Path("/{workId: [a-zA-Z0-9_]+}/items")
    @Produces(MIME_JSONLD + ENCODING_UTF8)
    public Response getWorkItems(@PathParam("workId") String workId) {
        Model model = service.retrieveWorkItemsById(workId);
        if (model.isEmpty()) {
            throw new NotFoundException();
        }

        return Response.ok().entity(jsonld.getJson(model))
                            .header("Access-Control-Allow-Origin", "*")
                            .header("Access-Control-Allow-Methods", "GET")
                            .allow("OPTIONS")
                            .build();
    }
}
