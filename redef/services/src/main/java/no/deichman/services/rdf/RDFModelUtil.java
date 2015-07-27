package no.deichman.services.rdf;

import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFDataMgr;

/**
 * Responsibility: Expose useful RDF model-related utility methods.
 */
public final class RDFModelUtil {

    private RDFModelUtil() {}

    public static Model modelFrom(String input, Lang lang) {
        InputStream is = new ByteArrayInputStream(input.getBytes(StandardCharsets.UTF_8));
        Model m = ModelFactory.createDefaultModel();
        RDFDataMgr.read(m, is, lang);
        return m;
    }
}
