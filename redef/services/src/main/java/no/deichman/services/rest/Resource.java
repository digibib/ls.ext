package no.deichman.services.rest;

import java.io.IOException;
import java.net.URI;
import javax.inject.Singleton;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Response;
import no.deichman.services.rdf.RDFModelUtil;
import org.apache.commons.io.IOUtils;
import org.apache.jena.riot.Lang;

/**
 * Responsibility: Answer questions about resources.
 */
@Singleton
@Path("describe")
public final class Resource {

    @GET
    public Response describe(@QueryParam("resource") String resource) throws IOException {

        if(resource.equals("http://lexvo.org/ontology#Language")) {
            return Response.ok().entity(
                    RDFModelUtil.stringFrom(
                            RDFModelUtil.modelFrom(
                                    IOUtils.toString(
                                            this.getClass().getClassLoader().getResourceAsStream("language.ttl")),
                                    Lang.TURTLE),
                            Lang.JSONLD))
                    .build();
        }

        return Response.seeOther(URI.create(resource)).build();
    }
}
