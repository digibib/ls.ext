package no.deichman.services.entity.z3950;

import com.google.gson.annotations.SerializedName;

/**
 * Responsibility: represent a label in a language.
 */
public final class Label {
    @SerializedName("@language")
    private String language;

    @SerializedName("@value")
    private String value;

    public Label(String language, String value) {
        this.language = language;
        this.value = value;
    }
}
