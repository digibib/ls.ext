package no.deichman.services.resources;

import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;
import no.deichman.services.ontology.OntologyService;
import no.deichman.services.uridefaults.BaseURI;
import no.deichman.services.uridefaults.BaseURIDefault;
import no.deichman.services.utils.JSONLD;
import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFDataMgr;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Response;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

@Path("ontology")
public class OntologyResource {

    private final OntologyService ontologyService;
    private BaseURI baseURI;

    public OntologyResource(){
        this(new BaseURIDefault());
    }

    public OntologyResource(BaseURI base) {
        this(new OntologyService(base));
        this.baseURI = base;
    }

    public OntologyResource(OntologyService ontologyService) {
        this.ontologyService = ontologyService;
    }

    @GET
    @Produces("text/turtle")
	public Response getOntologyTurtle() throws IOException {
        return buildGetResponseWith(ontologyService.getOntologyTurtle());
	}

    @GET
    @Produces("application/ld+json")
	public Response getOntologyJSON() throws IOException {
        return buildGetResponseWith(asJson(ontologyService.getOntologyTurtle()));
	}

    private Response buildGetResponseWith(String result) {
        return Response.ok().entity(result)
                .header("Access-Control-Allow-Origin", "*")
                .header("Access-Control-Allow-Methods", "GET")
                .allow("OPTIONS")
                .build();
    }

    private String asJson(String turtleOntology) {
        InputStream is = new ByteArrayInputStream(turtleOntology.getBytes(StandardCharsets.UTF_8));
        Model m = ModelFactory.createDefaultModel();
        RDFDataMgr.read(m, is, Lang.TURTLE);
        JSONLD jsonld = new JSONLD(baseURI);
        return jsonld.getJson(m);
    }

}
