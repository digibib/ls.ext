package no.deichman.services.entity.z3950;

import com.google.gson.annotations.SerializedName;

/**
 * Created by kristoffer on 03.09.2016.
 */
public class Contributor extends ExternalDataObject {
    @SerializedName("deichman:name")
    private String name;

    public final String getName() {
        return name;
    }

    public final void setName(String name) {
        this.name = name;
    }
}
