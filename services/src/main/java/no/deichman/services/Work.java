package no.deichman.services;
 
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
 
@Path("/work")
public class Work {
 
    @GET
    @Path("/")
    @Produces(MediaType.APPLICATION_JSON)
    public Response listWork() {
        String jsonString = "{\"message\":\"Hello,client!\"}";
        return Response.ok(jsonString).build();
    }
}