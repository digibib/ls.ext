package no.deichman.services.utils;

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFDataMgr;
import org.junit.Test;

import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;

public class JSONLDTest {
	
	@Test
	public void test_it_creates_JSONLD() {
		String data = "<http://example.com/test> <http://example.com/onto/resource> <http://example.com/r/m2> .";
		InputStream in = new ByteArrayInputStream(data.getBytes(StandardCharsets.UTF_8));
		Model m = ModelFactory.createDefaultModel();
		RDFDataMgr.read(m, in, Lang.N3);
	    String result = JSONLD.getJson(m);
	    Model comparison = ModelFactory.createDefaultModel();
		InputStream into = new ByteArrayInputStream(result.getBytes(StandardCharsets.UTF_8));
	    RDFDataMgr.read(comparison, into, Lang.JSONLD);
	    assertNotNull(result);
		assertTrue(m.isIsomorphicWith(comparison));
	}

}
