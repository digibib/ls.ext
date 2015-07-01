package no.deichman.services.utils;

import static org.junit.Assert.assertEquals;

import java.util.Map;

import org.junit.Test;

import com.hp.hpl.jena.shared.PrefixMapping;
import com.hp.hpl.jena.vocabulary.RDFS;

import no.deichman.services.uridefaults.BaseURIMock;

public class DefaultPrefixesTest {
    @Test
    public void test_it_can_set_get_default_prefixes(){
        BaseURIMock bud = new BaseURIMock();
        DefaultPrefixes def = new DefaultPrefixes(bud);
        String prefix = "onto";
        String ns = "http://example.com/onto/";
        def.setPrefix(prefix,ns);
        String p = def.getNS(prefix);
        assertEquals(ns,p);
    }
    
    @Test
    public void test_it_returns_system_default_prefixes(){
        BaseURIMock bud = new BaseURIMock();
        DefaultPrefixes def = new DefaultPrefixes(bud);
        String deichman = "deichman";
        String deichmanNs = bud.getOntologyURI();
        String rdfs = "rdfs";
        String rdfsNs = RDFS.getURI();
        assertEquals(def.getNS(rdfs),rdfsNs);
        assertEquals(def.getNS(deichman),deichmanNs);
    }

}
