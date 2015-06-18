package no.deichman.services.resources;

import com.hp.hpl.jena.rdf.model.Model;

import no.deichman.services.error.PatchException;
import no.deichman.services.kohaadapter.KohaAdapter;
import no.deichman.services.repository.Repository;
import no.deichman.services.service.Service;
import no.deichman.services.service.ServiceDefault;
import no.deichman.services.uridefaults.BaseURI;
import no.deichman.services.uridefaults.BaseURIDefault;
import no.deichman.services.uridefaults.BaseURIMock;
import no.deichman.services.utils.JSONLD;
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
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.ResponseBuilder;

import java.io.UnsupportedEncodingException;
import java.net.URI;
import java.net.URISyntaxException;

@Path("/work")
public class WorkResource {

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

    public WorkResource() {
        super();
        service = new ServiceDefault();
        baseURI = new BaseURIDefault();
    }

    public WorkResource(KohaAdapter kohaAdapter, Repository repository, BaseURI b) {
        super();
        ServiceDefault serviceDefault = new ServiceDefault();
        serviceDefault.setKohaAdapter(kohaAdapter);
        serviceDefault.setRepository(repository);
        service = serviceDefault;
        baseURI = b;
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
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
    @Consumes(MediaType.APPLICATION_JSON)
    public Response updateWork(String work) {
        service.updateWork(work);
        return Response.ok()
                       .header("Access-Control-Allow-Origin", "*")
                       .header("Access-Control-Allow-Methods", "PUT")
                       .allow("OPTIONS")
                       .build();
    }

    @PATCH
    @Path("{workId: [a-zA-Z0-9_]+}")
    @Consumes("application/ldpatch+json")
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

        return Response.ok().entity(JSONLD.getJson(m))
                       .header("Access-Control-Allow-Origin", "*")
                       .header("Access-Control-Allow-Methods", "PATCH")
                       .allow("OPTIONS")
                       .build();
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response listWork() {
        Model model = service.listWork();

        if (model.isEmpty()) {
            throw new NotFoundException();
        }

        return Response.ok().entity(JSONLD.getJson(model))
                       .header("Access-Control-Allow-Origin", "*")
                       .header("Access-Control-Allow-Methods", "GET")
                       .allow("OPTIONS")
                       .build();
    }

    @GET
    @Path("{workId: [a-zA-Z0-9_]+}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getWorkJSON(@PathParam("workId") String workId) {
        Model model = service.retrieveWorkById(workId);

        if (model.isEmpty()) {
            throw new NotFoundException();
        }

        return Response.ok().entity(JSONLD.getJson(model))
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
    @Path("{workId: [a-zA-Z0-9_]+}")
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
    @Path("{workId: [a-zA-Z0-9_]+}")
    public Response corsWorkId(@HeaderParam("Access-Control-Request-Headers") String reqHeader) {
        return makeCORS(Response.ok(), reqHeader);
    }

    @GET
    @Path("{workId: [a-zA-Z0-9_]+}/items")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getWorkItems(@PathParam("workId") String workId) {
        Model model = service.retrieveWorkItemsById(workId);
        if (model.isEmpty()) {
            throw new NotFoundException();
        }

        return Response.ok().entity(JSONLD.getJson(model))
                            .header("Access-Control-Allow-Origin", "*")
                            .header("Access-Control-Allow-Methods", "GET")
                            .allow("OPTIONS")
                            .build();
    }
}
