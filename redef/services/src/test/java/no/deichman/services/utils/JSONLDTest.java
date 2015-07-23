package no.deichman.services.utils;

import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;
import com.hp.hpl.jena.vocabulary.RDFS;
import no.deichman.services.uridefaults.BaseURI;
import no.deichman.services.uridefaults.BaseURIMock;
import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFDataMgr;
import org.junit.Test;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Map;

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

public class JSONLDTest {

    @Test
    public void test_it_creates_JSONLD() {
        BaseURIMock bud = new BaseURIMock();
        String data = "<http://example.com/test> <http://example.com/onto/resource> <http://example.com/r/m2> .";
        InputStream in = new ByteArrayInputStream(data.getBytes(StandardCharsets.UTF_8));
        Model m = ModelFactory.createDefaultModel();
        RDFDataMgr.read(m, in, Lang.N3);
        JSONLD jsonld = new JSONLD();
        BaseURI baseURI = new BaseURIMock();
        jsonld.setBaseURI(baseURI);
        String result = jsonld.getJson(m);
        Model comparison = ModelFactory.createDefaultModel();
        InputStream into = new ByteArrayInputStream(result.getBytes(StandardCharsets.UTF_8));
        RDFDataMgr.read(comparison, into, Lang.JSONLD);
        assertNotNull(result);
        assertTrue(m.isIsomorphicWith(comparison));
        Map<String, String> ns = comparison.getNsPrefixMap();
        assertTrue(ns.get("deichman").equals(bud.getOntologyURI()));
        assertTrue(ns.get("rdfs").equals(RDFS.getURI()));
    }
}
