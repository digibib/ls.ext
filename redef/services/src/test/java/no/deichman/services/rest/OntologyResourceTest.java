package no.deichman.services.rest;


import java.io.IOException;
import javax.ws.rs.core.Response;
import static javax.ws.rs.core.Response.Status.OK;
import no.deichman.services.ontology.OntologyService;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import org.junit.Before;
import org.junit.Test;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class OntologyResourceTest {

    public static final String THE_JSONLD = "jsonld-sorta..";
    private static final String THE_TURTLE = "all the way down";
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
        when(mockOntologyService.getOntologyJsonLD()).thenReturn(THE_JSONLD);
        Response result = resource.getOntologyJSON();
        assertEquals(OK.getStatusCode(), result.getStatus());
        assertEquals(THE_JSONLD, result.getEntity());
    }

    @Test
    public void should_get_ontology_as_turtle() throws IOException {
        when(mockOntologyService.getOntologyTurtle()).thenReturn(THE_TURTLE);
        Response result = resource.getOntologyTurtle();
        assertEquals(OK.getStatusCode(), result.getStatus());
        assertEquals(THE_TURTLE, result.getEntity());
    }
}
