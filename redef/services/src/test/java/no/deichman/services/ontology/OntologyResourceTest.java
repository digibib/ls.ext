package no.deichman.services.ontology;


import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.junit.Before;
import org.junit.Test;

import javax.ws.rs.core.Response;
import java.io.IOException;

import static javax.ws.rs.core.Response.Status.OK;
import static no.deichman.services.testutil.TestJSON.assertValidJSON;
import static org.hamcrest.CoreMatchers.containsString;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class OntologyResourceTest {

    private static final Model THE_MODEL = ModelFactory.createDefaultModel();
    private OntologyResource resource;
    private OntologyService mockOntologyService;

    @Before
    public void setUp() throws Exception {
        mockOntologyService = mock(OntologyService.class);
        resource = new OntologyResource(mockOntologyService);
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
        OntologyService service = new FileBasedOntologyService();
        when(mockOntologyService.getOntology()).thenReturn(service.getOntology());
        Response result = resource.getOntologyTurtle();
        String actual = reduceWhiteSpace(result.getEntity().toString());
        assertThat(actual, containsString("@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>"));
    }

    private String reduceWhiteSpace(String string) {
        return string.trim().replaceAll("\\s+", " ");
    }
}
