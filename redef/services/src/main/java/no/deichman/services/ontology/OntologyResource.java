package no.deichman.services.ontology;

import no.deichman.services.rdf.JSONLDCreator;
import no.deichman.services.rdf.RDFModelUtil;
import org.apache.jena.riot.Lang;

import javax.inject.Singleton;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Response;
import java.io.IOException;

import static no.deichman.services.restutils.MimeType.DEFAULT;
import static no.deichman.services.restutils.MimeType.JSON;
import static no.deichman.services.restutils.MimeType.LD_JSON;
import static no.deichman.services.restutils.MimeType.PLAIN;
import static no.deichman.services.restutils.MimeType.TURTLE;
import static no.deichman.services.restutils.MimeType.UTF_8;

/**
 * Responsibility: Expose ontology as a REST resource.
 */
@Singleton
@Path("ontology")
public final class OntologyResource {

    private final OntologyService ontologyService;

    public OntologyResource() {
        this(new FileBasedOntologyService());
    }

    public OntologyResource(OntologyService ontologyService) {
        this.ontologyService = ontologyService;
    }

    @GET
    @Produces({TURTLE + UTF_8 + DEFAULT, PLAIN + UTF_8})
    public Response getOntologyTurtle() throws IOException {
        return Response.ok().entity(RDFModelUtil.stringFrom(ontologyService.getOntology(), Lang.TURTLE)).build();
    }

    @GET
    @Produces({LD_JSON + UTF_8, JSON + UTF_8})
    public Response getOntologyJSON() throws IOException {
        Response build = Response.ok().entity(getOntologyJsonLD()).build();
        return build;
    }

    private String getOntologyJsonLD() {
        return new JSONLDCreator().asJSONLD(ontologyService.getOntology());
    }

}
