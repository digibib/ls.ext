package no.deichman.services.rdf;

import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Resource;

import java.lang.reflect.Field;
import java.util.Arrays;
import java.util.List;

import static junit.framework.TestCase.assertTrue;
import static org.junit.Assert.assertEquals;


/**
 * Responsibility: provide a generic way of duplex testing membership in an ontology of RDF term helper classes.
 */
final class OntologyTestUtil {
    private OntologyTestUtil() {}
    static void inOntology(Model ontology, Class clazz, String[] omit) throws IllegalAccessException {
        List<Resource> uris = ontology.listSubjects().toList();

        Field[] fields = clazz.getDeclaredFields();
        for (Field field : fields) {
            field.setAccessible(true);
            if (!Arrays.asList(omit).contains(field.getName())) {
                Resource currentField = (Resource) field.get(field.getName());
                System.out.println("Checking that " + currentField.getURI() + " exists in ontology");
                assertTrue(uris.contains(currentField));
            }
        }

    }

    public  static void inClass(Model ontology, Class clazz) throws NoSuchFieldException, IllegalAccessException {
        for (Resource resource : ontology.listSubjects().toList()) {
            String fieldName = fieldNameFromResource(resource)
                    .replace("Ø", "OE")
                    .replace("Æ", "AE");

            System.out.println("Checking that " + resource.getURI() + " exists as " + fieldName + " in MediaType.class");
            Resource resourceFromClass = (Resource) clazz.getDeclaredField(fieldName).get(Resource.class);
            assertEquals(resource, resourceFromClass);
        }
    }

    private static String fieldNameFromResource(Resource resource) {
        return resource.getLocalName().toUpperCase().replace("-", "_");
    }
}
