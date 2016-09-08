package no.deichman.services.ontology;

import no.deichman.services.uridefaults.BaseURI;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.riot.Lang;
import org.junit.Test;

import java.io.IOException;

import static no.deichman.services.rdf.RDFModelUtil.stringFrom;
import static org.hamcrest.CoreMatchers.containsString;
import static org.hamcrest.CoreMatchers.not;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertThat;

public class FileBasedOntologyServiceTest {


    @Test
    public void should_have_replaced_uris() throws Exception {
        OntologyService service = new FileBasedOntologyService();
        Model ontology = service.getOntology();
        String turtle = stringFrom(ontology, Lang.TURTLE);
        assertThat(turtle, not(containsString("_BASE_URI_")));
        assertThat(turtle, containsString(BaseURI.root()));
    }

    @Test
    public void should_return_ontology_as_model() throws IOException {
        OntologyService service = new FileBasedOntologyService();
        assertNotNull(service.getOntology());
    }
}
