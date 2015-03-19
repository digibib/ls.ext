package no.deichman.services.resources;

import com.hp.hpl.jena.rdf.model.Model;
import java.io.StringWriter;
import javax.ws.rs.GET;
import javax.ws.rs.NotFoundException;
import javax.ws.rs.Path;
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

    @GET
    @Path("/")
    @Produces(MediaType.APPLICATION_JSON)
    public Response listWork() {
        return Response.ok("{\"message\":\"Hello World!\"}")
                .link("http://192.168.50.50:8080/work", "work")
                .header("Access-Control-Allow-Origin", "*")
                .header("Access-Control-Allow-Methods", "GET")
                .build();
    }

    @GET
    @Path("/{workId}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getWorkJSON(String workId) {

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
