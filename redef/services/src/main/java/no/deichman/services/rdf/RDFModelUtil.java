package no.deichman.services.rdf;

import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.io.StringWriter;
import java.nio.charset.StandardCharsets;
import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFDataMgr;
import org.apache.jena.riot.RDFFormat;

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

    public static String stringFrom(Model in, Lang lang) {
        final StringWriter out = new StringWriter();
        RDFDataMgr.write(out, in, lang);
        return out.toString();
    }

    public static String stringFrom(Model in, RDFFormat format) {
        final StringWriter out = new StringWriter();
        RDFDataMgr.write(out, in, format);
        return out.toString();
    }

}
