package no.deichman.services.entity.z3950;

import com.google.gson.annotations.SerializedName;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static com.google.common.collect.ImmutableMap.of;

/**
 * Responsibility: provide migration work object.
 */
@SuppressWarnings("checkstyle:DesignForExtension")
public class Work extends BibliographicObjectExternal {
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

    @SerializedName("deichman:missingMainEntry")
    private Boolean missingMainEntry;

    @SerializedName("deichman:isRelatedTo")
    private List<Map<String, String>> isRelatedTo;

    @SerializedName("deichman:biography")
    private ExternalDataObject biography;

    @SerializedName("deichman:hasContentAdaptation")
    private List<Map<String, String>> contentAdaptation;

    @SerializedName("deichman:hasClassification")
    private List<Map<String, String>> classifications;

    @SerializedName("deichman:fictionNonfiction")
    private ExternalDataObject fictionNonfiction;

    public Work(String workId) {
        super(workId);
    }

    Work() {
    }

    @Override
    protected void assignType() {
        this.setType("deichman:Work");
    }

    Work(String id, String title) {
        this.setId(id);
        this.setType("Work");
        this.setMainTitle(title);
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

    public final void addLiteraryForm(ExternalDataObject literaryForm) {
        if (this.literaryForm == null) {
            this.literaryForm = new ArrayList<>();
        }
        this.literaryForm.add(literaryForm);
    }

    public final void addSubject(ExternalDataObject subject) {
        if (this.subjects == null) {
            this.subjects = new ArrayList<>();
        }
        this.subjects.add(of("@id", subject.getId()));
    }

    public final void addGenre(ExternalDataObject genre) {
        if (this.genres == null) {
            this.genres = new ArrayList<>();
        }
        this.genres.add(of("@id", genre.getId()));
    }

    public final void setMissingMainEntry(boolean missingMainEntry) {
        this.missingMainEntry = missingMainEntry;
    }

    public void isRelatedTo(WorkRelation workRelationId) {
        if (this.isRelatedTo == null) {
            this.isRelatedTo = new ArrayList<>();
        }
        this.isRelatedTo.add(of("@id", workRelationId.getId()));
    }

    public final void setBiography(ExternalDataObject biography) {
        this.biography = biography;
    }

    public void addContentAdaption(ExternalDataObject contentAdaptation) {
        if (this.contentAdaptation == null) {
            this.contentAdaptation = new ArrayList<>();
        }
        this.contentAdaptation.add(of("@id", contentAdaptation.getId()));
    }

    public void addClassification(Classification classification) {
        if (this.classifications == null) {
            this.classifications = new ArrayList<>();
        }
        this.classifications.add(of("@id", classification.getId()));
    }

    public final void setFictionNonfiction(ExternalDataObject fictionNonfiction) {
        this.fictionNonfiction = fictionNonfiction;
    }
}
