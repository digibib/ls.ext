package no.deichman.services.entity.z3950;

import com.google.gson.annotations.SerializedName;
import org.apache.jena.vocabulary.RDF;

import java.util.HashMap;
import java.util.Map;

/**
 * Responsiblity: provide low scope json-ld context object.
 */
public class ContextObject {
    @SerializedName("@Context")
    private Map<String, Object> context;

    ContextObject() {
        context = new HashMap<String, Object>();
        context.put("deichman", "http://deichman.no/ontology#");
        context.put("duo", "http://deichman.no/utility#");
        context.put("rdfs", RDF.getURI());
    }

    public final Map<String, Object> getContext() {
        return context;
    }
}
