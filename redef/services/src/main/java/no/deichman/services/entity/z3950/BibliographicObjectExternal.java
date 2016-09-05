package no.deichman.services.entity.z3950;

import com.google.gson.annotations.SerializedName;
import org.apache.jena.vocabulary.RDF;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.google.common.collect.ImmutableMap.of;

/**
 * Responsibility: create a basic bibliographic object.
 */
class BibliographicObjectExternal extends ExternalDataObject {

    @SerializedName("deichman:contributor")
    protected List<Map<String, String>> contributor;
    @SerializedName("deichman:publicationYear")
    private String publicationYear;

    @SerializedName("deichman:partNumber")
    private String partNumber;

    @SerializedName("deichman:partTitle")
    private String partTitle;

    @SerializedName("deichman:mainTitle")
    private String mainTitle;

    @SerializedName("deichman:subtitle")
    private String subtitle;
    @SerializedName("deichman:ordinal")
    private String ordinal;

    BibliographicObjectExternal(String id) {
        setId(id);
    }

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

    public final void setPublicationYear(String publicationYear) {
        this.publicationYear = publicationYear;
    }

    public final void setPartNumber(String partNumber) {
        this.partNumber = partNumber;
    }

    public final void setPartTitle(String partTitle) {
        this.partTitle = partTitle;
    }

    public final String getPublicationYear() {
        return publicationYear;
    }

    public final void setOrdinal(String ordinal) {
        this.ordinal = ordinal;
    }

    public void addContributon(Contribution contribution) {
        if (this.contributor == null) {
            this.contributor = new ArrayList<>();
        }
        this.contributor.add(of("@id", contribution.getId()));
    }
}
