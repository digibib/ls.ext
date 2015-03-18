package no.deichman.services.resources;

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
        return Response.ok("{\"message\":\"Hello World!\"}")
                .link("http://192.168.50.50:8080/work", "work")
                .header("Access-Control-Allow-Origin", "*")
                .header("Access-Control-Allow-Methods", "GET")
                .build();
    }
    
    @GET
    @Path("/{workId}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getWork(String workId) {
        return Response.ok(mockWorkObjectAsJSON())
                .link(workId, workId)
                .header("Access-Control-Allow-Origin", "*")
                .header("Access-Control-Allow-Methods", "GET")
                .build();
    }



    private String mockWorkObjectAsJSON() {
        final String WORK_MOCK = "{\"id\": \"work_00001\", \"Title\": \"Sult\", \"creator\": \"Knut Hamsun\", \"date\": \"1890\", \"editions\": [{\"id\": \"edition_00001\", \"isbn\": \"82-05-27748-6\", \"placement\": \"Voksenavdelingen, Hovedbiblioteket\", \"shelf\": \"magasinet\", \"status\": \"På hylla\"}, {\"id\": \"edition_00001\", \"isbn\": \"82-05-27748-6\", \"placement\": \"Voksenavdelingen, Hovedbiblioteket\", \"status\": \"På hylla\"}]}";
        return WORK_MOCK;
    }
}
