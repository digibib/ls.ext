package no.deichman.services.ontology;

import no.deichman.services.rdf.RDFModelUtil;
import org.apache.commons.io.IOUtils;
import org.apache.jena.riot.Lang;

import javax.inject.Singleton;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Response;
import java.io.IOException;

import static no.deichman.services.restutils.MimeType.LD_JSON;
import static no.deichman.services.restutils.MimeType.UTF_8;

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
        return getJsonLdResponse("language.ttl");
    }

    @GET
    @Path("format")
    @Produces(LD_JSON + UTF_8)
    public Response format() throws IOException {
        return getJsonLdResponse("format.ttl");
    }

    @GET
    @Path("nationality")
    @Produces(LD_JSON + UTF_8)
    public Response nationality() throws IOException {
        return getJsonLdResponse("nationality.ttl");
    }

    @GET
    @Path("adaptionForParticularUserGroups")
    @Produces(LD_JSON + UTF_8)
    public Response adaptionForParticularUserGroups() throws IOException {
        return getJsonLdResponse("adaptionForParticularUserGroups.ttl");
    }

    @GET
    @Path("binding")
    @Produces(LD_JSON + UTF_8)
    public Response binding() throws IOException {
        return getJsonLdResponse("binding.ttl");
    }

    @GET
    @Path("writingSystem")
    @Produces(LD_JSON + UTF_8)
    public Response writingSystem() throws IOException {
        return getJsonLdResponse("writingSystem.ttl");
    }

    @GET
    @Path("illustrativeMatter")
    @Produces(LD_JSON + UTF_8)
    public Response illustrativeMatter() throws IOException {
        return getJsonLdResponse("illustrativeMatter.ttl");
    }

    private Response getJsonLdResponse(String filename) throws IOException {
        return Response.ok().entity(
                RDFModelUtil.stringFrom(
                        RDFModelUtil.modelFrom(
                                IOUtils.toString(
                                        this.getClass().getClassLoader().getResourceAsStream(filename)),
                                Lang.TURTLE),
                        Lang.JSONLD))
                .build();
    }
}
