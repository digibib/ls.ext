package no.deichman.services.ontology;

import no.deichman.services.rdf.RDFModelUtil;
import no.deichman.services.services.AppTest;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.riot.Lang;
import org.junit.Before;
import org.junit.Test;

import static org.junit.Assert.assertNotNull;
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
    public void should_return_expected_data() throws Exception {
        AppTest apptest = new AppTest();

        for (AuthorizedValue authorizedValue : AuthorizedValue.values()) {
            System.out.println("Testing authorized value resource: " + authorizedValue.getPath());
            Object body = authorizedValuesResource.getValueRange(authorizedValue.getPath()).getEntity();
            Model model = RDFModelUtil.modelFrom((String) body, Lang.JSONLD);
            Model comparison = apptest.getAuthorizedValueTestData(authorizedValue);
            assertTrue(authorizedValue.getPath() + " did not contain expected data", model.containsAll(comparison));
        }
    }
}
