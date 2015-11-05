package no.deichman.services.marc;

import no.deichman.services.entity.ResourceBase;

import javax.inject.Singleton;
import javax.servlet.ServletConfig;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.Response;

/**
 * Responsibility: TODO.
 */
@Singleton
@Path("marc")
public class MarcResource extends ResourceBase {
    public static final String SERVLET_INIT_PARAM_KOHA_PORT = "kohaPort";

    @Context
    private ServletConfig servletConfig;

    public MarcResource() {
    }

    @GET
    @Path("/{recordId: [0-9]+}")
    @Produces("application/xml")
    public final Response getMarcRecord(@PathParam("recordId") String recordId){
        return Response.ok().entity(getKohaAdapter().retrieveMarcXml(recordId)).build();
    }


    @Override
    protected final ServletConfig getConfig() {
        return servletConfig;
    }
}
