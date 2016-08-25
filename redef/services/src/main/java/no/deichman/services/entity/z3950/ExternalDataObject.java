package no.deichman.services.entity.z3950;

import com.google.gson.annotations.SerializedName;

import java.util.ArrayList;
import java.util.List;

/**
 * Responsibility: provide basic object for data objects from outside LS.ext.
 */
class ExternalDataObject {
    @SerializedName("@type")
    private List<String> type;

    @SerializedName("@id")
    private String id;

    @SerializedName("deichman:specification")
    private String specification;

    String bNodize(String id) {
        String value = id;
        if (!testBNodeId(id)) {
            value = "_:" + id;
        }
        return value;
    }

    public final List<String> getType() {
        return type;
    }

    public final void setType(String type) {
        if (this.type == null) {
            this.type = new ArrayList<>();
        }
        this.type.add(type);
    }

    private boolean testBNodeId(String id) {
        boolean value = false;
        if (id.matches("^_:.+|^http://.*")) {
            value = true;
        }
        return value;
    }

    public final void setId(String id) {
        this.id = bNodize(id);
    }

    public final String getId() {
        return this.id;
    }

    public void setSpecification(String specification) {
        this.specification = specification;
    }

    public String getSpecification() {
        return specification;
    }
}
