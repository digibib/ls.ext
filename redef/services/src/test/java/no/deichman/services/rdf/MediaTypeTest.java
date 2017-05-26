package no.deichman.services.rdf;

import no.deichman.services.utils.ResourceReader;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.riot.Lang;
import org.junit.Before;
import org.junit.Test;

/**
 * Responsibility: tests class MediaType against ontology.
 */
public class MediaTypeTest {

    private Model mediaTypeOntology;
    private Class mediaType;

    @Before
    public void setup() throws ClassNotFoundException {
        mediaTypeOntology = RDFModelUtil.modelFrom(new ResourceReader().readFile("mediaType.ttl"), Lang.TURTLE);
        ClassLoader classLoader = MediaTypeTest.class.getClassLoader();
        mediaType = classLoader.loadClass("no.deichman.services.rdf.MediaType");
    }

    @Test
    public void test_all_resources_are_in_ontology() throws IllegalAccessException {
        String[] omit = {"NAMESPACE"};
        OntologyTestUtil.inOntology(mediaTypeOntology, mediaType, omit);
    }

    @Test
    public void test_all_ontology_elements_are_represented() throws NoSuchFieldException, IllegalAccessException {
        OntologyTestUtil.inClass(mediaTypeOntology, mediaType);
    }
}
