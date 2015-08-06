package no.deichman.services.rest.utils;


import com.hp.hpl.jena.vocabulary.RDFS;
import no.deichman.services.uridefaults.BaseURI;

import java.util.HashMap;
import java.util.Map;

/**
 * Responsibility: Returns a prefix mapping for Deichman serializations.
 */
final class DefaultPrefixes {

    private Map<String, String> prefixMapping = new HashMap<>();
    private BaseURI baseURI;

    DefaultPrefixes(BaseURI baseURI){
        this.baseURI = baseURI;
        prefixMapping.put("rdfs", RDFS.getURI());
        prefixMapping.put("deichman", this.baseURI.ontology());
    }
    
    void set(String prefix, String ns){
        prefixMapping.put(prefix, ns);
    }

    String get(String prefix) {
        return prefixMapping.get(prefix);
    }

    Map<String, String> getAll() {
        return prefixMapping;
    }
}
