package no.deichman.services.resources;

import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;
import no.deichman.services.ontology.OntologyDefault;
import no.deichman.services.utils.JSONLD;
import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFDataMgr;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Response;
import java.io.IOException;
import java.io.InputStream;

@Path("ontology")
public class OntologyResource {

    @GET
    @Produces("text/turtle")
	public Response getOntologyTurtle() throws IOException {
        OntologyDefault ontology = new OntologyDefault();

        return Response.ok().entity(ontology.toString())
                .header("Access-Control-Allow-Origin", "*")
                .header("Access-Control-Allow-Methods", "GET")
                .allow("OPTIONS")
                .build();
	}

    @GET
    @Produces("application/ld+json")
	public Response getOntologyJSON() throws IOException {

        OntologyDefault ontology = new OntologyDefault();
        InputStream stream = ontology.toInputStream();
		Model m = ModelFactory.createDefaultModel();
		RDFDataMgr.read(m, stream, Lang.TURTLE);

        return Response.ok().entity(JSONLD.getJson(m))
                .header("Access-Control-Allow-Origin", "*")
                .header("Access-Control-Allow-Methods", "GET")
                .allow("OPTIONS")
                .build();
	}
}
