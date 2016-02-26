package no.deichman.services.ontology;


import no.deichman.services.rdf.RDFModelUtil;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ResourceFactory;
import org.apache.jena.riot.Lang;
import org.apache.jena.vocabulary.RDFS;
import org.junit.Before;
import org.junit.Test;

import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

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
        Response response = authorizedValuesResource.getValueRange("language");
        assertThat(response.getStatus(), equalTo(Status.OK.getStatusCode()));
    }

    @Test
    public void should_actually_return_some_language_data() throws Exception {
        Object body = authorizedValuesResource.getValueRange("language").getEntity();
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
        Object body = authorizedValuesResource.getValueRange("format").getEntity();
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
        Object body = authorizedValuesResource.getValueRange("nationality").getEntity();
        Model model = RDFModelUtil.modelFrom((String) body, Lang.JSONLD);
        boolean hasEnglish = model.contains(ResourceFactory.createStatement(
                ResourceFactory.createResource("http://data.deichman.no/nationality#eng"),
                RDFS.label,
                ResourceFactory.createLangLiteral("Engelsk", "no")
        ));
        assertTrue("model doesn't have English nationality", hasEnglish);
    }

    @Test
    public void should_actually_return_some_literaryForm_data() throws Exception {
        Object body = authorizedValuesResource.getValueRange("literaryForm").getEntity();
        Model model = RDFModelUtil.modelFrom((String) body, Lang.JSONLD);
        boolean hasNovel = model.contains(ResourceFactory.createStatement(
                ResourceFactory.createResource("http://data.deichman.no/literaryForm#novel"),
                RDFS.label,
                ResourceFactory.createLangLiteral("Roman", "no")
        ));
        assertTrue("model doesn't have Novel literary form", hasNovel);
    }

    @Test
    public void should_actually_return_some_audience_data() throws Exception {
        Object body = authorizedValuesResource.getValueRange("audience").getEntity();
        Model model = RDFModelUtil.modelFrom((String) body, Lang.JSONLD);
        boolean hasAdults = model.contains(ResourceFactory.createStatement(
                ResourceFactory.createResource("http://data.deichman.no/audience#adult"),
                RDFS.label,
                ResourceFactory.createLangLiteral("Voksne", "no")
        ));
        assertTrue("model doesn't have Adults audience", hasAdults);
    }

    @Test
    public void should_actually_return_some_biographicalContent_data() throws Exception {
        Object body = authorizedValuesResource.getValueRange("biography").getEntity();
        Model model = RDFModelUtil.modelFrom((String) body, Lang.JSONLD);
        boolean hasAutobiography = model.contains(ResourceFactory.createStatement(
                ResourceFactory.createResource("http://data.deichman.no/biography#autobiography"),
                RDFS.label,
                ResourceFactory.createLangLiteral("Selvbiografi", "no")
        ));
        assertTrue("model doesn't have Autobiography", hasAutobiography);
    }
    
    @Test
    public void should_actually_return_some_adaptationForPublication_data() throws Exception {
        Object body = authorizedValuesResource.getValueRange("adaptationOfPublicationForParticularUserGroups").getEntity();
        Model model = RDFModelUtil.modelFrom((String) body, Lang.JSONLD);
        boolean hasBraille = model.contains(ResourceFactory.createStatement(
                ResourceFactory.createResource("http://data.deichman.no/adaptationForParticularUserGroups#braille"),
                RDFS.label,
                ResourceFactory.createLangLiteral("Blindeskrift", "no")
        ));
        assertTrue("model doesn't have Braille publication adaptation", hasBraille);
    }
    
    @Test
    public void should_actually_return_some_adaptationForWork_data() throws Exception {
        Object body = authorizedValuesResource.getValueRange("adaptationOfWorkForParticularUserGroups").getEntity();
        Model model = RDFModelUtil.modelFrom((String) body, Lang.JSONLD);
        boolean hasEasyLanguage = model.contains(ResourceFactory.createStatement(
                ResourceFactory.createResource("http://data.deichman.no/adaptationOfWorkForParticularUserGroups#easyContent"),
                RDFS.label,
                ResourceFactory.createLangLiteral("Lettlest, enkelt innhold", "no")
        ));
        assertTrue("model doesn't have Easy language", hasEasyLanguage);
    }
}
