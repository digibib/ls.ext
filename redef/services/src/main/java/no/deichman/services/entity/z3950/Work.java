package no.deichman.services.entity.z3950;

import com.google.gson.annotations.SerializedName;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.google.common.collect.ImmutableMap.of;

/**
 * Responsibility: provide migration work object.
 */
@SuppressWarnings("checkstyle:DesignForExtension")
public class Work extends BibliographicObjectExternal {
    @SerializedName("deichman:contributor")
    private Map<String, String> contributor;

    @SerializedName("deichman:hasSummary")
    private String summary;

    @SerializedName("deichman:audience")
    private List<ExternalDataObject> audience;

    @SerializedName("deichman:literaryForm")
    private List<ExternalDataObject> literaryForm;

    @SerializedName("deichman:subject")
    private List<Map<String, String>> subjects;

    @SerializedName("deichman:genre")
    private List<Map<String, String>> genres;

    @SerializedName("deichman:publicationYear")
    private String publicationYear;

    @SerializedName("deichman:partNumber")
    private String partNumber;

    @SerializedName("deichman:partTitle")
    private String partTitle;

    @SerializedName("deichman:missingMainEntry")
    private Boolean missingMainEntry;

    public final Map<String, String> getContributor() {
        return contributor;
    }

    public final void setContributor(String contributor) {
        Map<String, String> contributionReference = new HashMap<>();
        contributionReference.put("@id", contributor);
        this.contributor = contributionReference;
    }

    Work() {
    }

    @Override
    protected void assignType() {
        this.setType("deichman:Work");
    }

    Work(String id, String title, String contributor) {
        this.setId(id);
        this.setType("Work");
        this.setMainTitle(title);
        this.setContributor(contributor);
    }

    public final void setHasSummary(String summary) {
        this.summary = summary;
    }

    public final String getSummary() {
        return summary;
    }

    public final void setAudience(ExternalDataObject audience) {
        if (this.audience == null) {
            this.audience = new ArrayList<>();
        }
        this.audience.add(audience);
    }

    public final void setLiteraryForm(ExternalDataObject literaryForm) {
        if (this.literaryForm == null) {
            this.literaryForm = new ArrayList<>();
        }
        this.literaryForm.add(literaryForm);
    }

    public void addSubject(String subjectId) {
        if (this.subjects == null) {
            this.subjects = new ArrayList<>();
        }
        this.subjects.add(of("@id", subjectId));
    }

    public void addGenre(String genreId) {
        if (this.genres == null) {
            this.genres = new ArrayList<>();
        }
        this.genres.add(of("@id", genreId));
    }

    public void setPublicationYear(String publicationYear) {
        this.publicationYear = publicationYear;
    }

    public void setPartNumber(String partNumber) {
        this.partNumber = partNumber;
    }

    public void setPartTitle(String partTitle) {
        this.partTitle = partTitle;
    }

    public void setMissingMainEntry(boolean missingMainEntry) {
        this.missingMainEntry = missingMainEntry;
    }
}
