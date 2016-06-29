package no.deichman.services.entity.z3950;

import com.google.gson.annotations.SerializedName;

import java.util.HashMap;
import java.util.Map;

/**
 * Responsibility: provide migration work object.
 */
public class Work extends BibliographicObjectExternal {
    @SerializedName("deichman:contributor")
    private Map<String, String> contributor;

    public final Map<String, String> getContributor() {
        return contributor;
    }

    public final void setContributor(String contributor) {
        Map<String, String> contributionReference = new HashMap<>();
        contributionReference.put("@id", contributor);
        this.contributor = contributionReference;
    }

    Work() {
        this.setType("deichman:Work");
    }
    Work(String id, String title, String contributor) {
        this.setId(id);
        this.setType("Work");
        this.setMainTitle(title);
        this.setContributor(contributor);
    }
}
