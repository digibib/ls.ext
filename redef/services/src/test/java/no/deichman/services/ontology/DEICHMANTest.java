package no.deichman.services.ontology;

import no.deichman.services.utils.ResourceReader;
import org.apache.commons.io.IOUtils;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.rdf.model.ResourceFactory;
import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFDataMgr;
import org.junit.Test;

import java.io.FileNotFoundException;
import java.io.InputStream;

import static org.junit.Assert.*;

/**
 * Responsibility: test DEICHMAN class.
 */
public class DEICHMANTest {

    private static final String NAMESPACE = "http://deichman.no/ontology#";

    @Test
    public void test_the_class_exists() {
        assertNotNull(new DEICHMAN());
    }

    @Test
    public void test_provides_base_uri() {
        assertEquals(DEICHMAN.getURI(), NAMESPACE);
    }

    @Test
    public void test_can_create_resource() {
        assertEquals(DEICHMAN.resource("Test"), ResourceFactory.createResource(NAMESPACE + "Test"));
    }

    @Test
    public void test_can_create_property() {
        assertEquals(DEICHMAN.property("test"), ResourceFactory.createProperty(NAMESPACE + "test"));
    }

    @Test
    public void test_class_is_aligned_with_ontology() throws FileNotFoundException {
        String ontology = new ResourceReader().readFile("ontology.ttl")
                .replace("__BASE_URI_ONTOLOGY__", NAMESPACE)
                .replace("__BASE_URI_VALUES__", "http://127.0.0.1/values#");
        InputStream inputStream = IOUtils.toInputStream(ontology);
        Model ontologyModel = ModelFactory.createDefaultModel();
        RDFDataMgr.read(ontologyModel, inputStream,
                Lang.TURTLE);
        ontologyModel.listSubjects().forEachRemaining(s -> {
                    DEICHMAN deichman = new DEICHMAN();
                    Object object = null;
                    try {
                        object = deichman.getClass().getField(s.getLocalName()).get(deichman);
                    } catch (NoSuchFieldException e) {
                        e.printStackTrace();
                    } catch (IllegalAccessException e) {
                        e.printStackTrace();
                    }

            assertEquals(s, object);
                }
        );
    }

}