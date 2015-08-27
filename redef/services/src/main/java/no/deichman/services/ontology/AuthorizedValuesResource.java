package no.deichman.services.ontology;

import java.io.IOException;
import javax.inject.Singleton;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Response;
import no.deichman.services.rdf.RDFModelUtil;
import org.apache.commons.io.IOUtils;
import org.apache.jena.riot.Lang;

import static no.deichman.services.restutils.MimeType.UTF_8;
import static no.deichman.services.restutils.MimeType.LD_JSON;

/**
 * Responsibility: Return authorized values for resources.
 */
@Singleton
@Path("authorized_values")
public final class AuthorizedValuesResource {

    @GET
    @Path("language")
    @Produces(LD_JSON + UTF_8)
    public Response language() throws IOException {
        return Response.ok().entity(
                RDFModelUtil.stringFrom(
                        RDFModelUtil.modelFrom(
                                IOUtils.toString(
                                        this.getClass().getClassLoader().getResourceAsStream("language.ttl")),
                                Lang.TURTLE),
                        Lang.JSONLD))
                .build();
    }
}
