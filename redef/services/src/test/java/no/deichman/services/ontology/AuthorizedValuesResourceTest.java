package no.deichman.services.ontology;


import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ResourceFactory;
import org.apache.jena.vocabulary.RDFS;
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

public class AuthorizedValuesResourceTest {

    private AuthorizedValuesResource authorizedValuesResource;

    @Before
    public void setUp() throws Exception {
        authorizedValuesResource = new AuthorizedValuesResource();
    }

    @Test
    public void should_have_default_constructor() {
        assertNotNull(new AuthorizedValuesResource());
    }

    @Test
    public void should_return_ok_when_getting_languages() throws Exception {
        Response response = authorizedValuesResource.language();
        assertThat(response.getStatus(), equalTo(Status.OK.getStatusCode()));
    }

    @Test
    public void should_actually_return_some_language_data() throws Exception {
        Object body = authorizedValuesResource.language().getEntity();
        Model model = RDFModelUtil.modelFrom((String) body, Lang.JSONLD);
        boolean hasEnglish = model.contains(ResourceFactory.createStatement(
                ResourceFactory.createResource("http://lexvo.org/id/iso639-3/eng"),
                RDFS.label,
                ResourceFactory.createLangLiteral("Engelsk", "no")
        ));
        assertTrue("model doesn't have English", hasEnglish);
    }

    @Test
    public void should_actually_return_format_data() throws Exception {
        Object body = authorizedValuesResource.format().getEntity();
        Model model = RDFModelUtil.modelFrom((String) body, Lang.JSONLD);
        boolean hasBook = model.contains(ResourceFactory.createStatement(
                ResourceFactory.createResource("http://data.deichman.no/format#Book"),
                RDFS.label,
                ResourceFactory.createLangLiteral("Bok", "no")
        ));
        assertTrue("model doesn't have Book", hasBook);
    }

    @Test
    public void should_actually_return_some_nationality_data() throws Exception {
        Object body = authorizedValuesResource.nationality().getEntity();
        Model model = RDFModelUtil.modelFrom((String) body, Lang.JSONLD);
        boolean hasEnglish = model.contains(ResourceFactory.createStatement(
                ResourceFactory.createResource("http://data.deichman.no/nationality#eng"),
                RDFS.label,
                ResourceFactory.createLangLiteral("Engelsk", "no")
        ));
        assertTrue("model doesn't have English nationality", hasEnglish);
    }
}
