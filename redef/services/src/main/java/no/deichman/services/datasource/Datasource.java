package no.deichman.services.datasource;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import no.deichman.services.entity.z3950.Mapper;
import no.deichman.services.entity.z3950.Z3950HttpClient;
import no.deichman.services.restutils.MimeType;

import javax.inject.Singleton;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Response;

import static no.deichman.services.restutils.MimeType.LD_JSON;

/**
 * Responsibility: Provide data from external resources.
 */

@Singleton
@Path("datasource")
public class Datasource {

    public Datasource() {}

    @GET
    @Path("{datasource: (bibbi|loc|dfb)}/{idType: (isbn|ean)}/{id: ([0-9Xx]+)}")
    @Produces(LD_JSON + MimeType.UTF_8)
    public final Response getByISBN(@PathParam("datasource") String datasource, @PathParam("idType") String idType, @PathParam("id") String id) throws Exception {
        Mapper mapper = new Mapper();

        Z3950HttpClient z3950HttpClient = new Z3950HttpClient();
        Gson gson = new GsonBuilder().setPrettyPrinting().create();

        String record = idType.equals("isbn") ? z3950HttpClient.getByIsbn(datasource, id) : z3950HttpClient.getByEan(datasource, id);

        String result = "";

        if (record != null) {
            result = gson.toJson(mapper.map(datasource, record));
        }

        return Response.ok().entity(result).build();
    }
}
