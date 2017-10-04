package no.deichman.services.entity.external;

import com.google.gson.annotations.SerializedName;

/**
 * Responsibility: mapping of things with a mainTitle.
 */
public class Titled extends ExternalDataObject {
    @SerializedName("deichman:mainTitle")
    private String mainTitle;

    public Titled(String mainTitle, String id) {
        setMainTitle(mainTitle);
        setId(id);
    }

    public Titled() {
    }

    public final String getMainTitle() {
        return mainTitle;
    }

    public final void setMainTitle(String mainTitle) {
        this.mainTitle = mainTitle;
    }
}
