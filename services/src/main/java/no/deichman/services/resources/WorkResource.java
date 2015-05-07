package no.deichman.services.resources;

import com.fasterxml.jackson.core.JsonParseException;
import com.github.jsonldjava.core.JsonLdError;
import com.github.jsonldjava.core.JsonLdOptions;
import com.github.jsonldjava.core.JsonLdProcessor;
import com.github.jsonldjava.utils.JsonUtils;
import com.hp.hpl.jena.rdf.model.Model;

import java.io.IOException;
import java.io.StringWriter;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.HashMap;
import java.util.Map;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.NotFoundException;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import no.deichman.services.kohaadapter.KohaAdapter;
import no.deichman.services.repository.Repository;
import no.deichman.services.service.Service;
import no.deichman.services.service.ServiceDefault;
import no.deichman.services.utils.PATCH;

import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFDataMgr;

@Path("/work")
public class WorkResource {

    private final Service service;
    
    public WorkResource() {
        super();
        service = new ServiceDefault();
    }

    public WorkResource(KohaAdapter kohaAdapter, Repository repository) {
        super();
        ServiceDefault serviceDefault = new ServiceDefault();
        serviceDefault.setKohaAdapter(kohaAdapter);
        serviceDefault.setRepository(repository);
        service = serviceDefault;
    }

    @POST
    public Response createWork() throws URISyntaxException {
        String workId = service.createWork();
        URI location = new URI(workId);

        return Response.created(location)
                       .header("Access-Control-Allow-Origin", "*")
                       .header("Access-Control-Allow-Methods", "POST")
                       .build();
    }

    @PUT
    @Consumes(MediaType.APPLICATION_JSON)
    public Response updateWork(String work) {
        service.updateWork(work);
        return Response.ok()
                       .header("Access-Control-Allow-Origin", "*")
                       .header("Access-Control-Allow-Methods", "PUT")
                       .build();
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response listWork() {
        Model model = service.listWork();

        if (model.isEmpty()) {
            throw new NotFoundException();
        }

        return Response.ok().entity(asJson(model))
                       .header("Access-Control-Allow-Origin", "*")
                       .header("Access-Control-Allow-Methods", "GET")
                       .build();
    }

    @GET
    @Path("/{workId: [a-zA-Z0-9_]+}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getWorkJSON(@PathParam("workId") String workId) {
        Model model = service.retriveWorkById(workId);

        if (model.isEmpty()) {
            throw new NotFoundException();
        }

        return Response.ok().entity(asJson(model))
                            .header("Access-Control-Allow-Origin", "*")
                            .header("Access-Control-Allow-Methods", "POST")
                            .build();
    }

    @GET
    @Path("/{workId: [a-zA-Z0-9_]+}/items")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getWorkItems(@PathParam("workId") String workId) {
        Model model = service.retrieveWorkItemsById(workId);
        if (model.isEmpty()) {
            throw new NotFoundException();
        }

        return Response.ok().entity(asJson(model))
                            .header("Access-Control-Allow-Origin", "*")
                            .header("Access-Control-Allow-Methods", "POST")
                            .build();
    }

    private String asJson(Model model) {
        StringWriter sw = new StringWriter();
        RDFDataMgr.write(sw, model, Lang.JSONLD);
        String s = new String();
        try {
            Object jsonObject = JsonUtils.fromString(sw.toString());
            JsonLdOptions options = new JsonLdOptions();
            options.format = "application/jsonld";

            final Map<String, Object> nses = new HashMap<String, Object>();
            nses.put("dcterms", "http://purl.org/dc/terms/");
            nses.put("deichman", "http://deichman.no/ontology#");
            final Map<String, Object> ctx = new HashMap<String, Object>();
            ctx.put("@context", nses);

            Object compact = JsonLdProcessor.compact(jsonObject, ctx, options);

            s = JsonUtils.toPrettyString(compact);
        } catch (JsonParseException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        } catch (JsonLdError e) {
            e.printStackTrace();
        }
        return s;
    }

}
