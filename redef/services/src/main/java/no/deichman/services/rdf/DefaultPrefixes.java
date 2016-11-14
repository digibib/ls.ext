package no.deichman.services.rdf;


import org.apache.jena.vocabulary.DCTerms;
import org.apache.jena.vocabulary.RDFS;

import java.util.HashMap;
import java.util.Map;

/**
 * Responsibility: Returns a prefix mapping for Deichman serializations.
 */
final class DefaultPrefixes {

    private Map<String, String> prefixMapping = new HashMap<>();

    DefaultPrefixes(String deichmanOntologyBaseUri){
        prefixMapping.put("rdfs", RDFS.getURI());
        prefixMapping.put("dcterms", DCTerms.getURI());
        prefixMapping.put("deichman", deichmanOntologyBaseUri);
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
