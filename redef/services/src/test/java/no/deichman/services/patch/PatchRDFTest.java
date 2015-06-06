package no.deichman.services.patch;

import static org.junit.Assert.*;

import java.io.UnsupportedEncodingException;

import org.junit.Before;
import org.junit.Test;

import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;
import com.hp.hpl.jena.rdf.model.Property;
import com.hp.hpl.jena.rdf.model.RDFNode;
import com.hp.hpl.jena.rdf.model.Resource;
import com.hp.hpl.jena.rdf.model.ResourceFactory;
import com.hp.hpl.jena.rdf.model.Statement;

import no.deichman.services.error.PatchException;
import no.deichman.services.repository.RepositoryInMemory;
public class PatchRDFTest {
	
	private static RepositoryInMemory testRepository;
	
	@Before
	public void init() {
		testRepository = new RepositoryInMemory();
	}
	
	@Test
	public void test_can_fail_to_add_when_triple_exists() throws UnsupportedEncodingException, PatchException{
		Resource subject = ResourceFactory.createResource("http://example.com/test_can_fail_to_add_when_triple_exists");
		Property predicate = ResourceFactory.createProperty("http://example.com/property");
		RDFNode object = ResourceFactory.createPlainLiteral("House");
		Statement statement = ResourceFactory.createStatement(subject, predicate, object);
		Model testModel = ModelFactory.createDefaultModel();
		testRepository.addData(testModel.add(statement));
		
		Patch patch = new Patch("add",statement,null);
		PatchRDF p = new PatchRDF();
		try {
            p.patch(testRepository, patch);
            fail("Triple already exists");
		} catch (PatchException patchException) {
			assertEquals("Triple already exists",patchException.getMessage());
		}
	}

	@Test
	public void test_can_fail_to_add_when_resource_does_not_exist() throws UnsupportedEncodingException, PatchException{
		Resource subject = ResourceFactory.createResource("http://example.com/test_can_fail_to_add_when_resource_does_not_exist");
		Property predicate = ResourceFactory.createProperty("http://example.com/property");
		RDFNode object = ResourceFactory.createPlainLiteral("House");
		Statement statement = ResourceFactory.createStatement(subject, predicate, object);
		
		Patch patch = new Patch("add",statement,null);
		PatchRDF p = new PatchRDF();
		try {
            p.patch(testRepository, patch);
            fail("Attempting to patch a nonexistent resource");
		} catch (PatchException patchException) {
			assertEquals("Attempting to patch a nonexistent resource [default graph]",patchException.getMessage());
		}
	}

	@Test
	public void test_adds_triple() throws UnsupportedEncodingException, PatchException {
		Resource subject = ResourceFactory.createResource("http://example.com/test_adds_triple");
		Property predicate = ResourceFactory.createProperty("http://example.com/property");
		RDFNode object = ResourceFactory.createPlainLiteral("House");
		Statement statement = ResourceFactory.createStatement(subject, predicate, object);
		Model testModel = ModelFactory.createDefaultModel();
		testRepository.addData(testModel.add(statement));
		RDFNode object2 = ResourceFactory.createPlainLiteral("House2");
		Statement statement2 = ResourceFactory.createStatement(subject, predicate, object2);
		Patch patch = new Patch("add",statement2,null);
		PatchRDF p = new PatchRDF();
        p.patch(testRepository, patch);

        assertTrue(testRepository.askIfStatementExists(statement2));
	}

	@Test
	public void test_deletes_triple() throws UnsupportedEncodingException, PatchException {
		Resource subject = ResourceFactory.createResource("http://example.com/test_deletes_triple");
		Property predicate = ResourceFactory.createProperty("http://example.com/property");
		RDFNode object = ResourceFactory.createPlainLiteral("House");
		Statement statement = ResourceFactory.createStatement(subject, predicate, object);
		Model testModel = ModelFactory.createDefaultModel();
		testRepository.addData(testModel.add(statement));
		Patch patch = new Patch("del", statement, null);
		PatchRDF p = new PatchRDF();
        p.patch(testRepository, patch);
        assertFalse(testRepository.askIfStatementExists(statement));
	}

	@Test
	public void test_does_not_delete_nonexistent_triple() throws UnsupportedEncodingException {
		Resource subject = ResourceFactory.createResource("http://example.com/test_does_not_delete_nonexistent_triple");
		Property predicate = ResourceFactory.createProperty("http://example.com/property");
		RDFNode object = ResourceFactory.createPlainLiteral("House");
		Statement statement = ResourceFactory.createStatement(subject, predicate, object);
		Model testModel = ModelFactory.createDefaultModel();
		testRepository.addData(testModel.add(statement));
		RDFNode object2 = ResourceFactory.createPlainLiteral("House2");
		Statement statement2 = ResourceFactory.createStatement(subject, predicate, object2);
		Patch patch = new Patch("del",statement2,null);
		PatchRDF p = new PatchRDF();
		try {
            p.patch(testRepository, patch);
            fail("Triple does not exist");
		} catch (PatchException patchException) {
			assertEquals("Triple does not exist",patchException.getMessage());
		}
	}
	

	@Test
	public void test_adds_triple_to_named_graph() throws UnsupportedEncodingException, PatchException {
		Resource subject = ResourceFactory.createResource("http://example.com/test_adds_triple_to_named_graph");
		Property predicate = ResourceFactory.createProperty("http://example.com/property");
		RDFNode object = ResourceFactory.createPlainLiteral("House");
		Statement statement = ResourceFactory.createStatement(subject, predicate, object);
		String named = "http://example.com/p/named";
		Model testModel = ModelFactory.createDefaultModel();
		testRepository.updateNamedGraph(testModel.add(statement), named);
		RDFNode object2 = ResourceFactory.createPlainLiteral("House2");
		Statement statement2 = ResourceFactory.createStatement(subject, predicate, object2);
		Patch patch = new Patch("add",statement2,named);
		PatchRDF p = new PatchRDF();
		p.patch(testRepository, patch);
        assertTrue(testRepository.askIfStatementExistsInGraph(statement2, named));
	}

	@Test
	public void test_fails_when_adding_triple_to_nonexistent_named_graph() throws UnsupportedEncodingException, PatchException {
		Resource subject = ResourceFactory.createResource("http://example.com/test_fails_when_adding_triple_to_nonexistent_named_graph");
		Property predicate = ResourceFactory.createProperty("http://example.com/property");
		String named = "http://example.com/p/does_not_exist";
		RDFNode object2 = ResourceFactory.createPlainLiteral("House2");
		Statement statement2 = ResourceFactory.createStatement(subject, predicate, object2);
		Patch patch = new Patch("add",statement2,named);
		PatchRDF p = new PatchRDF();
		try {
            p.patch(testRepository, patch);
            fail("Attempting to patch a nonexistent graph <" + named + ">");
		} catch (PatchException patchException) {
			assertEquals("Attempting to patch a nonexistent graph <" + named + ">",patchException.getMessage());
		}
	}

	@Test
	public void test_can_fail_to_add_when_triple_exists_in_named_graph() throws UnsupportedEncodingException, PatchException{
		Resource subject = ResourceFactory.createResource("http://example.com/test_can_fail_to_add_when_triple_exists");
		Property predicate = ResourceFactory.createProperty("http://example.com/property");
		RDFNode object = ResourceFactory.createPlainLiteral("House");
		Statement statement = ResourceFactory.createStatement(subject, predicate, object);
		Model testModel = ModelFactory.createDefaultModel();
		String named = "http://example.com/p/named";
		testRepository.updateNamedGraph(testModel.add(statement), named);
		Patch patch = new Patch("add",statement,named);
		PatchRDF p = new PatchRDF();
		try {
            p.patch(testRepository, patch);
            fail("Triple already exists");
		} catch (PatchException patchException) {
			assertEquals("Triple already exists",patchException.getMessage());
		}
	}

	@Test
	public void test_can_fail_to_add_when_resource_does_not_exist_in_named_graph() throws UnsupportedEncodingException, PatchException{
		Resource subject = ResourceFactory.createResource("http://example.com/test_can_fail_to_add_when_resource_does_not_exist_in_named_graph");
		Property predicate = ResourceFactory.createProperty("http://example.com/property");
		RDFNode object = ResourceFactory.createPlainLiteral("House");
		Statement statement = ResourceFactory.createStatement(subject, predicate, object);
		Model testModel = ModelFactory.createDefaultModel();
		String named = "http://example.com/p/named";
		testRepository.updateNamedGraph(testModel.add(statement), named);
		Resource subject2 = ResourceFactory.createResource("http://example.com/this_resource_does_not_exist");
        Statement statement2 = ResourceFactory.createStatement(subject2, predicate, object);
		Patch patch = new Patch("add",statement2,named);
		PatchRDF p = new PatchRDF();
		try {
            p.patch(testRepository, patch);
            fail("Attempting to patch a nonexistent resource in named graph <" + named + ">");
		} catch (PatchException patchException) {
			assertEquals("Attempting to patch a nonexistent resource in named graph <" + named + ">",patchException.getMessage());
		}
	}

	@Test
	public void test_deletes_triple_from_named_graph() throws UnsupportedEncodingException, PatchException {
		Resource subject = ResourceFactory.createResource("http://example.com/test_deletes_triple_from_named_graph");
		Property predicate = ResourceFactory.createProperty("http://example.com/property");
		RDFNode object = ResourceFactory.createPlainLiteral("House");
		Statement statement = ResourceFactory.createStatement(subject, predicate, object);
		Model testModel = ModelFactory.createDefaultModel();
		String named = "http://example.com/p/named";
		testRepository.updateNamedGraph(testModel.add(statement), named);
		Patch patch = new Patch("del", statement, named);
		PatchRDF p = new PatchRDF();
        p.patch(testRepository, patch);
        assertFalse(testRepository.askIfStatementExists(statement));
	}

	@Test
	public void test_does_not_delete_nonexistent_triple_from_named_graph() throws UnsupportedEncodingException {
		Resource subject = ResourceFactory.createResource("http://example.com/test_does_not_delete_nonexistent_triple_from_named_graph");
		Property predicate = ResourceFactory.createProperty("http://example.com/property");
		RDFNode object = ResourceFactory.createPlainLiteral("House");
		Statement statement = ResourceFactory.createStatement(subject, predicate, object);
		Model testModel = ModelFactory.createDefaultModel();
		String named = "http://example.com/p/named";
		testRepository.updateNamedGraph(testModel.add(statement), named);
		RDFNode object2 = ResourceFactory.createPlainLiteral("House2");
		Statement statement2 = ResourceFactory.createStatement(subject, predicate, object2);
		Patch patch = new Patch("del",statement2,null);
		PatchRDF p = new PatchRDF();
		try {
            p.patch(testRepository, patch);
            fail("Triple does not exist");
		} catch (PatchException patchException) {
			assertEquals("Triple does not exist",patchException.getMessage());
		}
	}
}
