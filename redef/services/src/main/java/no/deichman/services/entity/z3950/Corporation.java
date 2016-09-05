package no.deichman.services.entity.z3950;

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

    public Corporation(String id, String name) {
        setType("deichman:Corporation");
        setId(id);
        setName(name);
    }

    public final void setPlace(String placeId) {
        this.place = of("@id", placeId);
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

}
