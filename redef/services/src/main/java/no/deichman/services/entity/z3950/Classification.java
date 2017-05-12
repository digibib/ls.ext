package no.deichman.services.entity.z3950;

import com.google.gson.annotations.SerializedName;

/**
 * Responsibility: handle mapping of dewey classification.
 */
public final class Classification extends ExternalDataObject {
    @SerializedName("deichman:hasClassificationNumber")
    private final String classificationNumber;

    @SerializedName("deichman:hasClassificationSource")
    private ExternalDataObject classificationSource;

    public Classification(String id, String classificationNumber) {
        setId(id);
        this.classificationNumber = classificationNumber;
    }

    public void setClassificationSource(ExternalDataObject classificationSource) {
        this.classificationSource = classificationSource;
    }
}
