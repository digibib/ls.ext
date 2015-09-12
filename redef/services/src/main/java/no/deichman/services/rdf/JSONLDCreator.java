package no.deichman.services.rdf;

import com.github.jsonldjava.core.JsonLdError;
import com.github.jsonldjava.core.JsonLdOptions;
import com.github.jsonldjava.core.JsonLdProcessor;
import com.github.jsonldjava.utils.JsonUtils;
import org.apache.jena.rdf.model.Model;

import no.deichman.services.restutils.MimeType;
import no.deichman.services.uridefaults.BaseURI;

import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFDataMgr;

import java.io.IOException;
import java.io.StringWriter;
import java.util.HashMap;
import java.util.Map;

/**
 * Responsibility: Create Deichman-flavoured JSON-LD string from RDF-model.
 */
public final class JSONLDCreator {

    private BaseURI baseURI;

    public JSONLDCreator() {}

    public JSONLDCreator(BaseURI base){
        baseURI = base;
    }

    public String asJSONLD(Model model) {
        StringWriter sw = new StringWriter();
        RDFDataMgr.write(sw, model, Lang.JSONLD);
        String s = "";
        try {
            Object jsonObject = JsonUtils.fromString(sw.toString());
            JsonLdOptions options = new JsonLdOptions();
            options.format = MimeType.LD_JSON;
            options.useNamespaces = true;
            options.setUseNativeTypes(true);
            options.setCompactArrays(true);

            final Map<String, Object> ctx = new HashMap<>();
            DefaultPrefixes defaultPrefixes = new DefaultPrefixes(this.baseURI.ontology());
            ctx.put("@context", defaultPrefixes.getAll());

            Object compact = JsonLdProcessor.compact(jsonObject, ctx, options);

            s = JsonUtils.toPrettyString(compact);
        } catch (IOException | JsonLdError e) {
            e.printStackTrace();
        }
        System.out.println(s);
        return s;
    }

    public void setBaseURI(BaseURI base) {
        baseURI = base;
    }

}
