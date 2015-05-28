package no.deichman.services.resources;

import com.fasterxml.jackson.core.JsonParseException;
import com.github.jsonldjava.core.JsonLdError;
import com.github.jsonldjava.core.JsonLdOptions;
import com.github.jsonldjava.core.JsonLdProcessor;
import com.github.jsonldjava.utils.JsonUtils;
import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.StringWriter;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.HashMap;
import java.util.Map;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.HeaderParam;
import javax.ws.rs.NotFoundException;
import javax.ws.rs.OPTIONS;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.ResponseBuilder;

import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFDataMgr;

import no.deichman.services.kohaadapter.KohaAdapter;
import no.deichman.services.repository.Repository;
import no.deichman.services.service.Service;
import no.deichman.services.service.ServiceDefault;
import no.deichman.services.utils.JSONLD;
import no.deichman.services.utils.PATCH;



@Path("/")
public class Resources {
	
	private String _corsHeaders;

	private Response makeCORS(ResponseBuilder req, String returnMethod) {
	   ResponseBuilder rb = req.header("Access-Control-Allow-Origin", "*")
	      .header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH");

	   if (!"".equals(returnMethod)) {
	      rb.header("Access-Control-Allow-Headers", returnMethod);
	   }

	   return rb.build();
	}

	private Response makeCORS(ResponseBuilder req) {
	   return makeCORS(req, _corsHeaders);
	}


    private final Service service;
    
    public Resources() {
        super();
        service = new ServiceDefault();
    }

    public Resources(KohaAdapter kohaAdapter, Repository repository) {
        super();
        ServiceDefault serviceDefault = new ServiceDefault();
        serviceDefault.setKohaAdapter(kohaAdapter);
        serviceDefault.setRepository(repository);
        service = serviceDefault;
    }

    @Path("work")
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

    @Path("work")
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

    @Path("work")
    @PATCH
    @Consumes("application/n-triples")
    public Response patchWork(String work) {
//TODO        service.updateWork(work);

        return Response.ok()
                       .header("Access-Control-Allow-Origin", "*")
                       .header("Access-Control-Allow-Methods", "PATCH")
                       .allow("OPTIONS")
                       .build();
    }

    @Path("work")
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
    @Path("work/{workId: [a-zA-Z0-9_]+}")
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

    @Path("work")
    @OPTIONS
    @Produces(MediaType.APPLICATION_JSON)
    public Response corsWorkBase(@HeaderParam("Access-Control-Request-Headers") String reqHeader) {
        _corsHeaders = reqHeader;
        return makeCORS(Response.ok(), reqHeader);
    }

    @OPTIONS
    @Path("work/{workId: [a-zA-Z0-9_]+}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response corsWorkId(@HeaderParam("Access-Control-Request-Headers") String reqHeader) {
        _corsHeaders = reqHeader;
        return makeCORS(Response.ok(), reqHeader);
    }

    @GET
    @Path("work/{workId: [a-zA-Z0-9_]+}/items")
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
    
    @Path("ontology")
    @GET
    @Produces("application/LD+JSON")
	public Response getOntology() throws FileNotFoundException {

		Model m = ModelFactory.createDefaultModel();
		InputStream in = this.getClass().getClassLoader().getResourceAsStream("ontology.ttl");
		RDFDataMgr.read(m, in, Lang.TURTLE);

        return Response.ok().entity(JSONLD.getJson(m))
                .header("Access-Control-Allow-Origin", "*")
                .header("Access-Control-Allow-Methods", "GET")
                .allow("OPTIONS")
                .build();
	}

}
