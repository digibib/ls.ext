package no.deichman.services.entity.external;

import com.google.gson.annotations.SerializedName;
import org.apache.commons.lang3.StringUtils;
import org.apache.jena.vocabulary.RDF;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.google.common.collect.ImmutableMap.of;
import static org.apache.commons.lang3.StringUtils.join;

/**
 * Responsibility: create a basic bibliographic object.
 */
class BibliographicObjectExternal extends ExternalDataObject {

    @SerializedName("deichman:contributor")
    private List<Map<String, String>> contributor;

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

    @SerializedName("deichman:altTitle")
    private List<String> altTitle;

    @SerializedName("deichman:language")
    private List<ExternalDataObject> language;

    private transient String untranscribedMainTitle;

    private transient String untranscribedSubTitle;

    @SerializedName("deichman:untranscribedTitle")
    private String untranscribedTitle;

    private void  setUntranscribedTitle() {
        untranscribedTitle = join(Arrays.stream(new String[]{untranscribedMainTitle, untranscribedSubTitle}).filter(StringUtils::isNotBlank).toArray(), " : ");
    }

    BibliographicObjectExternal(String id) {
        setId(id);
    }

    public final String getMainTitle() {
        return mainTitle;
    }

    public final void setMainTitle(String mainTitle) {
        this.mainTitle = mainTitle;
    }


    BibliographicObjectExternal() {
    }

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

    public void addAltTitle(String altTitle) {
        if (this.altTitle == null) {
            this.altTitle = new ArrayList<>();
        }
        this.altTitle.add(altTitle);
    }

    public final void addLanguage(ExternalDataObject language) {
        if (this.language == null) {
            this.language = new ArrayList<>();
        }
        this.language.add(language);
    }

    public void setUntranscribedMainTitle(String untranscribedMainTitle) {
        this.untranscribedMainTitle = untranscribedMainTitle;
        setUntranscribedTitle();
    }

    public void setUntranscribedSubTitle(String untranscribedSubTitle) {
        this.untranscribedSubTitle = untranscribedSubTitle;
        setUntranscribedTitle();
    }
}
