package no.deichman.services.rdf;

import no.deichman.services.uridefaults.BaseURI;
import org.apache.jena.vocabulary.RDFS;
import org.junit.Test;

import java.util.HashMap;
import java.util.Map;

import static org.junit.Assert.assertEquals;

public class DefaultPrefixesTest {

    @Test
    public void test_it_can_set_get_default_prefixes(){
        DefaultPrefixes def = new DefaultPrefixes(BaseURI.ontology());
        String prefix = "onto";
        String ns = "http://example.com/onto/";
        def.set(prefix,ns);
        String p = def.get(prefix);
        assertEquals(ns,p);
    }

    @Test
    public void test_it_returns_system_default_prefixes(){
        DefaultPrefixes def = new DefaultPrefixes(BaseURI.ontology());
        String deichman = "deichman";
        String deichmanNs = BaseURI.ontology();
        String rdfs = "rdfs";
        String rdfsNs = RDFS.getURI();
        assertEquals(def.get(rdfs),rdfsNs);
        assertEquals(def.get(deichman),deichmanNs);
    }

    @Test
    public void test_it_returns_prefixes(){
        DefaultPrefixes def = new DefaultPrefixes(BaseURI.ontology());
        String deichman = "deichman";
        String deichmanNs = BaseURI.ontology();
        String rdfs = "rdfs";
        String rdfsNs = RDFS.getURI();
        Map<String,String> map = new HashMap<String,String>();
        map.put(deichman, deichmanNs);
        map.put(rdfs, rdfsNs);
        assertEquals(def.getAll(),map);
    }
}
