package no.deichman.services.entity.z3950;

import com.google.gson.annotations.SerializedName;

import java.util.ArrayList;
import java.util.List;

/**
 * Responsibility: provide basic object for data objects from outside LS.ext.
 */
@SuppressWarnings("checkstyle:DesignForExtension")
public class ExternalDataObject implements Labeled {
    public ExternalDataObject() {
        assignType();
    }

    protected void assignType() {}

    @SerializedName("@type")
    private List<String> type;

    @SerializedName("@id")
    private String id;

    @SerializedName("deichman:specification")
    private String specification;

    @SerializedName("deichman:alternativeName")
    private String alternativeName;

    @SerializedName("deichman:ordinal")
    private String ordinal;

    @SerializedName("deichman:prefLabel")
    private String prefLabel;

    public final String bNodize(String id) {
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
        this.type = new ArrayList<>();
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

    public final void setSpecification(String specification) {
        this.specification = specification;
    }

    public final void setAlternativeName(String alternativeName) {
        this.alternativeName = alternativeName;
    }

    public final void setOrdinal(String ordinal) {
        this.ordinal = ordinal;
    }

    public final String getSpecification() {
        return specification;
    }

    public void addType(String type) {
        this.type.add(type);
    }

    public void setPrefLabel(String prefLabel) {
        this.prefLabel = prefLabel;
    }
}
