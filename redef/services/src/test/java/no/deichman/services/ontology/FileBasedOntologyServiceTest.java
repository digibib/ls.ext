package no.deichman.services.ontology;

import java.io.IOException;
import no.deichman.services.rdf.RDFModelUtil;
import no.deichman.services.uridefaults.BaseURI;
import org.apache.jena.riot.Lang;
import org.junit.Test;

import static no.deichman.services.rdf.RDFModelUtil.modelFrom;
import static org.hamcrest.CoreMatchers.containsString;
import static org.hamcrest.CoreMatchers.not;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertThat;

public class FileBasedOntologyServiceTest {

    @Test
    public void should_return_ontology_as_turtle() throws IOException {
        OntologyService service = new FileBasedOntologyService(BaseURI.local());
        String ontology = service.getOntologyTurtle();
        assertNotNull(RDFModelUtil.modelFrom(ontology, Lang.TURTLE));
    }

    @Test
    public void should_have_replaced_uris() throws Exception {
        OntologyService service = new FileBasedOntologyService(BaseURI.local());
        String ontology = service.getOntologyTurtle();
        assertThat(ontology, not(containsString("_BASE_URI_")));
        assertThat(ontology, containsString(BaseURI.local().ontology()));
    }

    @Test
    public void should_return_as_jsonld() {
        OntologyService ontology = new FileBasedOntologyService(BaseURI.local());
        String result = ontology.getOntologyJsonLD();
        assertNotNull(result);
        assertNotNull(modelFrom(result, Lang.JSONLD));
    }
}
