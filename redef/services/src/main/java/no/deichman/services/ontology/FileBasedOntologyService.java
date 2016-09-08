package no.deichman.services.ontology;

import no.deichman.services.uridefaults.BaseURI;
import org.apache.commons.io.IOUtils;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.riot.Lang;

import java.io.IOException;
import java.io.InputStream;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import static no.deichman.services.rdf.RDFModelUtil.modelFrom;

/**
 * Responsibility: Read and return ontology (in different formats).
 */
public final class FileBasedOntologyService implements OntologyService {

    private static final String ONTOLOGY_TTL_FILE = "ontology.ttl";

    private final Map<String, String> baseUriReplacementMap;

    private static String ontologyFromFile; /* We use static for caching */

    public FileBasedOntologyService() {
        Map<String, String> tempMap = new HashMap<>();
        tempMap.put("__BASE_URI_ONTOLOGY__", BaseURI.ontology());
        tempMap.put("__BASE_URI_VALUES__", BaseURI.values());
        baseUriReplacementMap = Collections.unmodifiableMap(tempMap);
    }

    @Override
    public Model getOntology() {
        return modelFrom(getOntologyTurtle(), Lang.TURTLE);
    }

    private String getOntologyTurtle() {
        String result = readOntology();
        for (Map.Entry<String, String> replacement : baseUriReplacementMap.entrySet()) {
            result = result.replace(replacement.getKey(), replacement.getValue());
        }
        return result;
    }

    private static String readOntology() {
        if (ontologyFromFile == null) {
            ontologyFromFile = readFromFile(ONTOLOGY_TTL_FILE);
        }
        return ontologyFromFile;
    }

    private static String readFromFile(String ontologyFileName) {
        InputStream in = FileBasedOntologyService.class.getClassLoader().getResourceAsStream(ontologyFileName);
        try {
            return IOUtils.toString(in);
        } catch (IOException e) {
            throw new RuntimeException("Could not read file: " + ontologyFileName, e);
        }
    }

}
