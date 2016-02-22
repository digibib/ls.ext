package no.deichman.services.ontology;

import no.deichman.services.rdf.RDFModelUtil;
import org.apache.commons.io.IOUtils;
import org.apache.jena.riot.Lang;

import javax.inject.Singleton;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
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
    @Path("{valueRangeName:"
            + "language|"
            + "format|"
            + "nationality|"
            + "literaryForm|"
            + "audience|"
            + "biography|"
            + "adaptationOfPublicationForParticularUserGroups|"
            + "adaptationOfWorkForParticularUserGroups|"
            + "binding|"
            + "writingSystem|"
            + "illustrativeMatter|"
            + "role}")
    @Produces(LD_JSON + UTF_8)
    public Response getValueRange(@PathParam("valueRangeName") String valueRangeName) throws IOException {
        return getJsonLdResponse(valueRangeName + ".ttl");
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
