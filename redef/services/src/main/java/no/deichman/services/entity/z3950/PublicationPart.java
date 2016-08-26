package no.deichman.services.entity.z3950;

import com.google.gson.annotations.SerializedName;

import java.util.Map;

/**
 * Responsibility: provide publication part object.
 */
@SuppressWarnings("checkstyle:DesignForExtension")
public class PublicationPart extends Contribution {

    @SerializedName("deichman:improperWork")
    private boolean improperWork;

    @SerializedName("deichman:endsAtPage")
    private Integer  endsAtPage;

    @SerializedName("deichman:startsAtPage")
    private Integer startsAtPage;

    @SerializedName("deichman:publicationOf")
    private Map<String, String> publicationOf;

    @SerializedName("deichman:hasOriginalTitle")
    private String hasOriginalTitle;

    PublicationPart() {
    }

    @Override
    protected final void assignType() {
        this.setType("deichman:PublicationPart");
    }

    public final String getHasOriginalTitle() {
        return hasOriginalTitle;
    }

    public final void setHasOriginalTitle(String hasOriginalTitle) {
        this.hasOriginalTitle = hasOriginalTitle;
    }

    public final boolean isImproperWork() {
        return improperWork;
    }

    public final void setImproperWork(boolean improperWork) {
        this.improperWork = improperWork;
    }

    public final Integer getEndsAtPage() {
        return endsAtPage;
    }

    public final void setEndsAtPage(Integer endsAtPage) {
        this.endsAtPage = endsAtPage;
    }

    public final Integer getStartsAtPage() {
        return startsAtPage;
    }

    public final void setStartsAtPage(Integer startsAtPage) {
        this.startsAtPage = startsAtPage;
    }

    public final Map<String, String> getPublicationOf() {
        return publicationOf;
    }

    public final void setPublicationOf(Map<String, String> publicationOf) {
        this.publicationOf = publicationOf;
    }
}
