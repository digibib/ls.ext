package no.deichman.services.rest;


import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ResourceFactory;
import com.hp.hpl.jena.vocabulary.RDFS;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;
import no.deichman.services.rdf.RDFModelUtil;
import org.apache.jena.riot.Lang;
import org.junit.Before;
import org.junit.Test;

import static org.hamcrest.CoreMatchers.equalTo;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.assertTrue;

public class ResourceTest {

    private Resource resource;

    @Before
    public void setUp() throws Exception {
        resource = new Resource();
    }

    @Test
    public void should_have_default_constructor() {
        assertNotNull(new Resource());
    }

    @Test
    public void should_return_ok_when_getting_languages() throws Exception {

        Response response = resource.describe("http://lexvo.org/ontology#Language");
        assertThat(response.getStatus(), equalTo(Status.OK.getStatusCode()));
    }

    @Test
    public void should_actually_return_some_language_data() throws Exception {

        Object body = resource.describe("http://lexvo.org/ontology#Language").getEntity();
        Model model = RDFModelUtil.modelFrom((String) body, Lang.JSONLD);
        boolean hasEnglish = model.contains(ResourceFactory.createStatement(
                ResourceFactory.createResource("http://lexvo.org/id/iso639-3/eng"),
                RDFS.label,
                ResourceFactory.createLangLiteral("Engelsk", "no")
        ));
        assertTrue("model doesn't have English", hasEnglish);

    }

    @Test
    public void should_return_304_for_unknown_resources() throws Exception {
        Response response = resource.describe("something:else");
        assertThat(response.getStatus(), equalTo(Status.SEE_OTHER.getStatusCode()));
        assertThat(response.getHeaderString("Location"), equalTo("something:else"));
    }

    //    @Test
//    public void should_get_ontology_as_jsonld() throws IOException {
//        when(mockOntologyService.getOntologyJsonLD()).thenReturn(THE_JSONLD);
//        Response result = resource.getOntologyJSON();
//        assertEquals(OK.getStatusCode(), result.getStatus());
//        assertEquals(THE_JSONLD, result.getEntity());
//    }
//
//    @Test
//    public void should_get_ontology_as_turtle() throws IOException {
//        when(mockOntologyService.getOntologyTurtle()).thenReturn(THE_TURTLE);
//        Response result = resource.getOntologyTurtle();
//        assertEquals(OK.getStatusCode(), result.getStatus());
//        assertEquals(THE_TURTLE, result.getEntity());
//    }
}
