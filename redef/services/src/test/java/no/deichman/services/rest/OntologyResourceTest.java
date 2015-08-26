package no.deichman.services.rest;


import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;
import java.io.IOException;
import javax.ws.rs.core.Response;
import no.deichman.services.ontology.FileBasedOntologyService;
import no.deichman.services.ontology.OntologyService;
import no.deichman.services.uridefaults.BaseURI;
import org.junit.Before;
import org.junit.Test;

import static javax.ws.rs.core.Response.Status.OK;
import static no.deichman.services.rest.utils.TestJSON.assertValidJSON;
import static org.hamcrest.CoreMatchers.containsString;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class OntologyResourceTest {

    public static final Model THE_MODEL = ModelFactory.createDefaultModel();
    private OntologyResource resource;
    private OntologyService mockOntologyService;

    @Before
    public void setUp() throws Exception {
        mockOntologyService = mock(OntologyService.class);
        resource = new OntologyResource(mockOntologyService, BaseURI.local());
    }

    @Test
    public void should_have_default_constructor() {
        assertNotNull(new OntologyResource());
    }

    @Test
    public void should_get_ontology_as_jsonld() throws IOException {
        when(mockOntologyService.getOntology()).thenReturn(THE_MODEL);
        Response result = resource.getOntologyJSON();
        assertEquals(OK.getStatusCode(), result.getStatus());
        assertValidJSON(result.getEntity().toString());
    }

    @Test
    public void should_return_something_that_likely_is_turtle() throws IOException {
        OntologyService service = new FileBasedOntologyService(BaseURI.local());
        when(mockOntologyService.getOntology()).thenReturn(service.getOntology());
        Response result = resource.getOntologyTurtle();
        String actual = reduceWhiteSpace(result.getEntity().toString());
        assertThat(actual, containsString("@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>"));
    }

    private String reduceWhiteSpace(String string) {
        return string.trim().replaceAll("\\s+", " ");
    }
}
