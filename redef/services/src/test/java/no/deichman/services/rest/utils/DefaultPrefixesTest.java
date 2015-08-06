package no.deichman.services.rest.utils;

import com.hp.hpl.jena.vocabulary.RDFS;
import java.util.HashMap;
import java.util.Map;
import no.deichman.services.uridefaults.BaseURI;
import static org.junit.Assert.assertEquals;
import org.junit.Test;

public class DefaultPrefixesTest {

    @Test
    public void test_it_can_set_get_default_prefixes(){
        BaseURI baseURI = BaseURI.local();
        DefaultPrefixes def = new DefaultPrefixes(baseURI);
        String prefix = "onto";
        String ns = "http://example.com/onto/";
        def.set(prefix,ns);
        String p = def.get(prefix);
        assertEquals(ns,p);
    }

    @Test
    public void test_it_returns_system_default_prefixes(){
        BaseURI baseURI = BaseURI.local();
        DefaultPrefixes def = new DefaultPrefixes(baseURI);
        String deichman = "deichman";
        String deichmanNs = baseURI.ontology();
        String rdfs = "rdfs";
        String rdfsNs = RDFS.getURI();
        assertEquals(def.get(rdfs),rdfsNs);
        assertEquals(def.get(deichman),deichmanNs);
    }

    @Test
    public void test_it_returns_prefixes(){
        BaseURI baseURI = BaseURI.local();
        DefaultPrefixes def = new DefaultPrefixes(baseURI);
        String deichman = "deichman";
        String deichmanNs = baseURI.ontology();
        String rdfs = "rdfs";
        String rdfsNs = RDFS.getURI();
        Map<String,String> map = new HashMap<String,String>();
        map.put(deichman, deichmanNs);
        map.put(rdfs, rdfsNs);
        assertEquals(def.getAll(),map);
    }
}
