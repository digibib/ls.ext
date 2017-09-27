package no.deichman.services.entity.external;

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

    @SerializedName("deichman:mainTitle")
    private String mainTitle;

    public PublicationPart(Named contributor, String id) {
        super(contributor, id);
    }

    public PublicationPart(String id) {
        super(id);
    }

    @Override
    protected final void assignType() {
        this.setType("deichman:PublicationPart");
    }

    public final String getMainTitle() {
        return mainTitle;
    }

    public final void setMainTitle(String mainTitle) {
        this.mainTitle = mainTitle;
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
