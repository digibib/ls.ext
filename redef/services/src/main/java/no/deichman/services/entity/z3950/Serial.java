package no.deichman.services.entity.z3950;

import com.google.gson.annotations.SerializedName;

import java.util.Map;

import static com.google.common.collect.ImmutableMap.of;

/**
 * Responsibility: map serials.
 */
public class Serial extends Titled {
    @SerializedName("deichman:publishedBy")
    private Map<String, String> publishedBy;

    @SerializedName("deichman:ordinal")
    private String ordinal;

    @SerializedName("deichman:issn")
    private String issn;

    @Override
    protected final void assignType() {
        setType("deichman:Serial");
    }

    public Serial(String mainTitle, String id) {
        super(mainTitle, id);
    }

    public final void setPublisher(ExternalDataObject publisher) {
        publishedBy = of("@id", publisher.getId());
    }

    public final void setOrdinal(String ordinal) {
        this.ordinal = ordinal;
    }

    public final void setIssn(String issn) {
        this.issn = issn;
    }
}
