package no.deichman.services.rdf;

import no.deichman.services.utils.ResourceReader;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.riot.Lang;
import org.junit.Before;
import org.junit.Test;

/**
 * Responsibility: test Nationality test contains all and only the nationalities contained in the ontology.
 */
public class NationalityTest {
    private Model nationalityOntology;
    private Class nationality;

    @Before
    public void setup() throws ClassNotFoundException {
        nationalityOntology = RDFModelUtil.modelFrom(new ResourceReader().readFile("nationality.ttl"), Lang.TURTLE);
        ClassLoader classLoader = MediaTypeTest.class.getClassLoader();
        nationality = classLoader.loadClass("no.deichman.services.rdf.Nationality");
    }

    @Test
    public void test_all_resources_are_in_ontology() throws IllegalAccessException {
        String[] omit = {"NAMESPACE"};
        OntologyTestUtil.inOntology(nationalityOntology, nationality, omit);
    }

    @Test
    public void test_all_ontology_elements_are_represented() throws NoSuchFieldException, IllegalAccessException {
        OntologyTestUtil.inClass(nationalityOntology, nationality);
    }
}
