package no.deichman.services.utils;

import com.github.jsonldjava.core.JsonLdError;
import com.github.jsonldjava.core.JsonLdOptions;
import com.github.jsonldjava.core.JsonLdProcessor;
import com.github.jsonldjava.utils.JsonUtils;
import com.hp.hpl.jena.rdf.model.Model;

import no.deichman.services.uridefaults.BaseURI;

import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFDataMgr;

import java.io.IOException;
import java.io.StringWriter;
import java.util.HashMap;
import java.util.Map;

public class JSONLD {

    private BaseURI baseURI;

    public JSONLD(){
    }

    public JSONLD(BaseURI base){
        baseURI = base;
    }

    public String getJson(Model model) {
        StringWriter sw = new StringWriter();
        RDFDataMgr.write(sw, model, Lang.JSONLD);
        String s = "";
        try {
            Object jsonObject = JsonUtils.fromString(sw.toString());
            JsonLdOptions options = new JsonLdOptions();
            options.format = "application/jsonld";

            final Map<String, Object> ctx = new HashMap<>();
            DefaultPrefixes defaultPrefixes = new DefaultPrefixes(this.baseURI);
            ctx.put("@context", defaultPrefixes.getAll());

            Object compact = JsonLdProcessor.compact(jsonObject, ctx, options);

            s = JsonUtils.toPrettyString(compact);
        } catch (IOException | JsonLdError e) {
            e.printStackTrace();
        }
        return s;
    }

    public void setBaseURI(BaseURI base) {
        baseURI = base;
    }

}
