package no.deichman.services.utils;

import com.github.jsonldjava.core.JsonLdError;
import com.github.jsonldjava.core.JsonLdOptions;
import com.github.jsonldjava.core.JsonLdProcessor;
import com.github.jsonldjava.utils.JsonUtils;
import com.hp.hpl.jena.rdf.model.Model;
import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFDataMgr;

import java.io.IOException;
import java.io.StringWriter;
import java.util.HashMap;
import java.util.Map;

public class JSONLD {
    public static String getJson(Model model) {
        StringWriter sw = new StringWriter();
        RDFDataMgr.write(sw, model, Lang.JSONLD);
        String s = "";
        try {
            Object jsonObject = JsonUtils.fromString(sw.toString());
            JsonLdOptions options = new JsonLdOptions();
            options.format = "application/jsonld";

            final Map<String, String> nses = model.getNsPrefixMap();
            final Map<String, Object> ctx = new HashMap<>();
            ctx.put("@context", nses);

            Object compact = JsonLdProcessor.compact(jsonObject, ctx, options);

            s = JsonUtils.toPrettyString(compact);
        } catch (IOException | JsonLdError e) {
            e.printStackTrace();
        }
        return s;
    }


}
