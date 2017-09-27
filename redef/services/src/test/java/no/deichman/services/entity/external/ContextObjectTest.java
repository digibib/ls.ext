package no.deichman.services.entity.external;

import com.google.gson.Gson;
import org.apache.jena.system.JenaSystem;
import org.junit.BeforeClass;
import org.junit.Test;

import java.util.HashMap;
import java.util.Map;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

/**
 * Responsibility: Test context object.
 */
public class ContextObjectTest {
    @BeforeClass
    public static void setupJena() {
        JenaSystem.init(); // Needed to counter sporadic nullpointerexceptions because of context is not initialized.
    }

    @Test
    public void default_constructor_returns_context_object() {
        Map<String, String> map = new HashMap<String, String>();
        map.put("deichman", "http://deichman.no/ontology#");

        ContextObject contextObject = new ContextObject();
        assertTrue(contextObject.getContext().containsValue("http://deichman.no/ontology#"));

        String json = new Gson().toJson(contextObject);

        String comparisonJson = "{\"@Context\":{\"deichman\":\"http://deichman.no/ontology#\",\"rdfs\":\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\",\"duo\":\"http://deichman.no/utility#\"}}";

        assertEquals(comparisonJson,json);
    }
}
