package no.deichman.services.ontology;

import java.io.IOException;
import java.io.InputStream;
import static no.deichman.services.rdf.RDFModelUtil.modelFrom;
import no.deichman.services.rest.utils.JSONLDCreator;
import no.deichman.services.uridefaults.BaseURI;
import org.apache.commons.io.IOUtils;
import org.apache.jena.riot.Lang;

/**
 * Responsibility: Read and return ontology (in different formats).
 */
public final class FileBasedOntologyService implements OntologyService {

    private static final String BASE_URI_USED_IN_FILE = "http://data.deichman.no/lsext-model#";
    private static final String ONTOLOGY_TTL_FILE = "ontology.ttl";

    private static String turtleOntology; /* We use static for caching */

    private final BaseURI baseUri;

    public FileBasedOntologyService(BaseURI baseUri) {
        this.baseUri = baseUri;
    }

    @Override
    public String getOntologyTurtle() {
        if (turtleOntology == null) {
            turtleOntology = readOntology();
        }
        return turtleOntology;
    }

    @Override
    public String getOntologyJsonLD() {
        return new JSONLDCreator(baseUri).asJSONLD(modelFrom(getOntologyTurtle(), Lang.TURTLE));
    }

    private String readOntology() {
        return readFromFile(ONTOLOGY_TTL_FILE)
                .replace(
                        BASE_URI_USED_IN_FILE,
                        baseUri.getOntologyURI());
    }

    private String readFromFile(String ontologyFileName) {
        InputStream in = this.getClass().getClassLoader().getResourceAsStream(ontologyFileName);
        try {
            return IOUtils.toString(in);
        } catch (IOException e) {
            throw new RuntimeException("Could not read file: " + ontologyFileName, e);
        }
    }

}
