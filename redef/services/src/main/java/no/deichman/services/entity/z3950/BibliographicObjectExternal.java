package no.deichman.services.entity.z3950;

import com.google.gson.annotations.SerializedName;
import org.apache.jena.vocabulary.RDF;

import java.util.HashMap;
import java.util.Map;

/**
 * Responsibility: create a basic bibliographic object.
 */
class BibliographicObjectExternal extends ExternalDataObject {

    @SerializedName("deichman:mainTitle")
    private String mainTitle;
    @SerializedName("deichman:subtitle")
    private String subtitle;

    public final String getMainTitle() {
        return mainTitle;
    }

    public final void setMainTitle(String mainTitle) {
        this.mainTitle = mainTitle;
    }


    BibliographicObjectExternal() {}

    BibliographicObjectExternal(String mainTitle, String subtitle) {
        this.mainTitle = mainTitle;
        this.subtitle = subtitle;
    }

    public final Map<String, Object> getMap() {
        String ontology = "http//deichman.no/ontology#";
        Map<String, Object> map = new HashMap<>();
        map.put(RDF.type.getURI(), this.getType());
        map.put(ontology + "mainTitle", getMainTitle());
        map.put(ontology + "subtitle", getSubtitle());
        return map;
    }

    final String getSubtitle() {
        return subtitle;
    }

    final void setSubtitle(String subtitle) {
        this.subtitle = subtitle;
    }

}
