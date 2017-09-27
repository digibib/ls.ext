package no.deichman.services.entity.external;

import com.google.gson.annotations.SerializedName;

import java.util.List;

import static com.google.common.collect.Lists.newArrayList;

/**
 * Responsibility: represent a value with type and label(s) possibly in several languages.
 */
public final class LabeledValue {
    @SerializedName("@id")
    private String id;

    @SerializedName("@type")
    private String type;

    @SerializedName("rdfs:label")
    private List<Label> labels;

    public LabeledValue(String id, String type, String language, String label) {
        this.type = type;
        this.id = id;
        labels = newArrayList(new Label(language, label));
    }

    public String getId() {
        return id;
    }
}
