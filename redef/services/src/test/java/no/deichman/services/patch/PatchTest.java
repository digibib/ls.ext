package no.deichman.services.patch;

import no.deichman.services.patch.Patch;

import static org.junit.Assert.*;

import org.junit.Test;

import com.hp.hpl.jena.rdf.model.Property;
import com.hp.hpl.jena.rdf.model.RDFNode;
import com.hp.hpl.jena.rdf.model.Resource;
import com.hp.hpl.jena.rdf.model.ResourceFactory;
import com.hp.hpl.jena.rdf.model.Statement;

public class PatchTest {
	@Test
	public void test_can_create_new_patch() {
		Resource subject = ResourceFactory.createResource("http://example.com/test_can_create_new_patch");
		Property predicate = ResourceFactory.createProperty("http://example.com/property");
		RDFNode object = ResourceFactory.createPlainLiteral("House");
		Statement statement = ResourceFactory.createStatement(subject, predicate, object);
		Patch patch = new Patch("add",statement,null);
		assertNotNull(patch);
		assertEquals("add", patch.getOperation());
		assertEquals(statement, patch.getStatement());
		assertNull(patch.getGraph());
	}

}
