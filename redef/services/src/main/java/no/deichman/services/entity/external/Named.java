package no.deichman.services.entity.external;

import com.google.gson.annotations.SerializedName;

/**
 * Responsibility: mapping of things with a name.
 */
public class Named extends ExternalDataObject {
    @SerializedName("deichman:name")
    private String name;

    public Named(String name, String id) {
        setName(name);
        setId(id);
    }

    public Named() {
    }

    public final String getName() {
        return name;
    }

    public final void setName(String name) {
        this.name = name;
    }

}
