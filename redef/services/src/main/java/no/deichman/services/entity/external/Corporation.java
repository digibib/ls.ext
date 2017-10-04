package no.deichman.services.entity.external;

import com.google.gson.annotations.SerializedName;

import java.util.Map;

import static com.google.common.collect.ImmutableMap.of;

/**
 * Responsibility: create a basic person object.
 */
@SuppressWarnings("checkstyle:DesignForExtension")
public class Corporation extends Named {

    @SerializedName("deichman:subdivision")
    private String subdivision;

    @SerializedName("deichman:place")
    private Map<String, String> place;

    @SerializedName("deichman:ordinal")
    private String ordinal;

    public Corporation(String id, String name) {
        setType("deichman:Corporation");
        setId(id);
        setName(name);
    }

    public final void setPlace(ExternalDataObject place) {
        this.place = of("@id", place.getId());
    }

    public void setSubdivision(String subdivision) {
        this.subdivision = subdivision;
    }

    Corporation() {
    }

    @Override
    protected void assignType() {
        setType("deichman:Corporation");
    }

    public final void setOrdinal(String ordinal) {
        this.ordinal = ordinal;
    }
}
