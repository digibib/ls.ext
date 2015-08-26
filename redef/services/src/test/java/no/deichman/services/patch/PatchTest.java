package no.deichman.services.patch;

import com.hp.hpl.jena.rdf.model.Statement;
import org.junit.Test;

import static com.hp.hpl.jena.rdf.model.ResourceFactory.createStatement;
import static com.hp.hpl.jena.rdf.model.ResourceFactory.createResource;
import static com.hp.hpl.jena.rdf.model.ResourceFactory.createProperty;
import static com.hp.hpl.jena.rdf.model.ResourceFactory.createPlainLiteral;

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;

public class PatchTest {
    @Test
    public void test_can_create_new_plain_literal_patch() {
        Statement statement = createStatement(
                createResource("http://example.com/test_can_create_new_patch"),
                createProperty("http://example.com/property"),
                createPlainLiteral("House"));
        Patch patch = new Patch("add",statement,null);
        assertNotNull(patch);
        assertEquals("add", patch.getOperation());
        assertEquals(statement, patch.getStatement());
        assertFalse(statement.getObject().isResource());
        assertNull(patch.getGraph());
    }

    public void test_add_uri_object() {
        Statement statement = createStatement(
                createResource("http://example.com/test_add_uri_object"),
                createProperty("http://example.com/property"),
                createResource("http://this.should.be/a_uri"));
        Patch patch = new Patch("add", statement, null);
        assertEquals("add", patch.getOperation());
        assertEquals(statement, patch.getStatement());
        assertTrue(statement.getObject().isResource());
        assertNull(patch.getGraph());
    }
}
