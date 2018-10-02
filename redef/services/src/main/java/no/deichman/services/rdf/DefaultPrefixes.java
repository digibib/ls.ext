package no.deichman.services.rdf;


import org.apache.jena.vocabulary.RDFS;

import java.util.HashMap;
import java.util.Map;

/**
 * Responsibility: Returns a prefix mapping for Deichman serializations.
 */
public final class DefaultPrefixes {

    private Map<String, Object> ontologyMapping = new HashMap<>();
    private Map<String, Object> authMapping = new HashMap<>();

    public DefaultPrefixes(String deichmanOntologyBaseUri){
        ontologyMapping.put("rdfs", RDFS.getURI());
        ontologyMapping.put("deichman", deichmanOntologyBaseUri);
        authMapping.put("duo", "http://data.deichman.no/utility#");
        authMapping.put("nationality", "http://data.deichman.no/nationality#");
        authMapping.put("binding","http://data.deichman.no/binding#");
        authMapping.put("format","http://data.deichman.no/format#");
        authMapping.put("audience","http://data.deichman.no/audience#");
        authMapping.put("literaryForm","http://data.deichman.no/literaryForm#");
        authMapping.put("biography","http://data.deichman.no/biography#");
        authMapping.put("key","http://data.deichman.no/key#");
        authMapping.put("role","http://data.deichman.no/role#");
        authMapping.put("fictionNonfiction","http://data.deichman.no/fictionNonfiction#");
        authMapping.put("relationType","http://data.deichman.no/relationType#");
        authMapping.put("contentAdaptation","http://data.deichman.no/contentAdaptation#");
        authMapping.put("formatAdaptation","http://data.deichman.no/formatAdaptation#");
        authMapping.put("mediaType", "http://data.deichman.no/mediaType#");
        authMapping.put("label", "http://www.w3.org/2000/01/rdf-schema#label");
        authMapping.put("language", "http://lexvo.org/id/iso639-3/");
        authMapping.put("classificationSource", "http://data.deichman.no/classificationSource#");
        authMapping.put("rdfs", RDFS.getURI());
        authMapping.put("deichman", deichmanOntologyBaseUri);
    }

    public Map<String, Object> getForAuthorizedValues() {
        return authMapping;
    }

    Map<String, Object> getForOntology() {
        return ontologyMapping;
    }
}
