package no.deichman.services.utils;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

import java.util.HashMap;
import java.util.Map;

import org.junit.Test;

import com.hp.hpl.jena.shared.PrefixMapping;
import com.hp.hpl.jena.vocabulary.RDFS;

import no.deichman.services.uridefaults.BaseURIMock;

public class DefaultPrefixesTest {

    @Test
    public void test_it_exists(){
        assertNotNull(new DefaultPrefixes());
    }

    @Test
    public void test_it_can_set_get_default_prefixes(){
        BaseURIMock bud = new BaseURIMock();
        DefaultPrefixes def = new DefaultPrefixes(bud);
        String prefix = "onto";
        String ns = "http://example.com/onto/";
        def.set(prefix,ns);
        String p = def.get(prefix);
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
        assertEquals(def.get(rdfs),rdfsNs);
        assertEquals(def.get(deichman),deichmanNs);
    }

    @Test
    public void test_it_returns_prefixes(){
        BaseURIMock bud = new BaseURIMock();
        DefaultPrefixes def = new DefaultPrefixes(bud);
        String deichman = "deichman";
        String deichmanNs = bud.getOntologyURI();
        String rdfs = "rdfs";
        String rdfsNs = RDFS.getURI();
        Map<String,String> map = new HashMap<String,String>();
        map.put(deichman, deichmanNs);
        map.put(rdfs, rdfsNs);
        assertEquals(def.getAll(),map);
    }
}
