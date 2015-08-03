package no.deichman.services.rest;

import no.deichman.services.ontology.FileBasedOntologyService;
import no.deichman.services.ontology.OntologyService;
import no.deichman.services.uridefaults.BaseURI;
import no.deichman.services.uridefaults.BaseURIDefault;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Response;
import java.io.IOException;

/**
 * Responsibility: Expose ontology as a REST resource.
 */
@Path("ontology")
public final class OntologyResource {

    private final OntologyService ontologyService;

    public OntologyResource(){
        this(new BaseURIDefault());
    }

    public OntologyResource(BaseURI baseURI) {
        this(new FileBasedOntologyService(baseURI));
    }

    public OntologyResource(OntologyService ontologyService) {
        this.ontologyService = ontologyService;
    }

    @GET
    @Produces("text/turtle" + "; charset=utf-8")
    public Response getOntologyTurtle() throws IOException {
        return Response.ok().entity(ontologyService.getOntologyTurtle()).build();
    }

    @GET
    @Produces("application/ld+json" + "; charset=utf-8")
    public Response getOntologyJSON() throws IOException {
        return Response.ok().entity(ontologyService.getOntologyJsonLD()).build();
    }

}
