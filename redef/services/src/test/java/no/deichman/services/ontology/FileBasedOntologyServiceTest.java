package no.deichman.services.ontology;

import com.hp.hpl.jena.rdf.model.Model;
import java.io.IOException;
import no.deichman.services.uridefaults.BaseURI;
import org.apache.jena.riot.Lang;
import org.junit.Test;

import static no.deichman.services.rdf.RDFModelUtil.stringFrom;
import static org.hamcrest.CoreMatchers.containsString;
import static org.hamcrest.CoreMatchers.not;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertThat;

public class FileBasedOntologyServiceTest {

    public static final String SOME_BASE_URI = BaseURI.LOCAL_BASE_URI_ROOT;


    @Test
    public void should_have_replaced_uris() throws Exception {
        OntologyService service = new FileBasedOntologyService(BaseURI.local());
        Model ontology = service.getOntology();
        String turtle = stringFrom(ontology, Lang.TURTLE);
        assertThat(turtle, not(containsString("_BASE_URI_")));
        assertThat(turtle, containsString(SOME_BASE_URI));
    }

    @Test
    public void should_return_ontology_as_model() throws IOException {
        OntologyService service = new FileBasedOntologyService(BaseURI.local());
        assertNotNull(service.getOntology());
    }
}
