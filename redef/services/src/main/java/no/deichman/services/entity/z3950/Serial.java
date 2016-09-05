package no.deichman.services.entity.z3950;

import com.google.gson.annotations.SerializedName;

import java.util.Map;

import static com.google.common.collect.ImmutableMap.of;

/**
 * Responsibility: map serials.
 */
public class Serial extends Named {
    @SerializedName("deichman:publishedBy")
    private Map<String, String> publishedBy;

    @Override
    protected final void assignType() {
        setType("deichman:Serial");
    }

    public Serial(String name, String id) {
        super(name, id);
    }

    public final void setPublisher(String publisherId) {
        publishedBy = of("@id", publisherId);
    }
}
