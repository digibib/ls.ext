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
import no.deichman.services.service.Service;
import no.deichman.services.service.ServiceDefault;
import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFDataMgr;

@Path("/work")
public class WorkResource {

    private static final Service SERVICE = new ServiceDefault();

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    public Response createWork(String work) {
        SERVICE.createWork(work);
        return Response.created(null)
                .build();
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response listWork() {
        StringWriter sw = new StringWriter();
        Model model = SERVICE.listWork();
        if (!model.isEmpty()) {
            RDFDataMgr.write(sw, model, Lang.JSONLD);

            String data = sw.toString();

            return Response.ok()
                    .entity(data)
                    .build();
        } else {
            throw new NotFoundException();
        }
    }

    @GET
    @Path("/{workId: [a-zA-Z0-9_]+}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getWorkJSON(@PathParam("workId") String workId) {

        StringWriter sw = new StringWriter();
        Model model = SERVICE.retriveWorkById(workId);
        if (!model.isEmpty()) {
            RDFDataMgr.write(sw, model, Lang.JSONLD);

            String data = sw.toString();

            return Response.ok()
                    .entity(data)
                    .build();
        } else {
            throw new NotFoundException();
        }
    }
}
