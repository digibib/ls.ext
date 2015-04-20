package no.deichman.services.resources;

import com.hp.hpl.jena.rdf.model.Model;
import java.io.StringWriter;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.NotFoundException;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import no.deichman.services.kohaadapter.KohaAdapter;
import no.deichman.services.repository.Repository;
import no.deichman.services.service.Service;
import no.deichman.services.service.ServiceDefault;
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
    @Consumes(MediaType.APPLICATION_JSON)
    public Response createWork(String work) {
        service.createWork(work);
        return Response.created(null).build();
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response listWork() {
        Model model = service.listWork();

        if (model.isEmpty()) {
            throw new NotFoundException();
        }

        return Response.ok().entity(asJson(model)).build();
    }

    @GET
    @Path("/{workId: [a-zA-Z0-9_]+}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getWorkJSON(@PathParam("workId") String workId) {
        Model model = service.retriveWorkById(workId);

        if (model.isEmpty()) {
            throw new NotFoundException();
        }

        return Response.ok().entity(asJson(model)).build();
    }

    private String asJson(Model model) {
        StringWriter sw = new StringWriter();
        RDFDataMgr.write(sw, model, Lang.JSONLD);
        return sw.toString();
    }

}
