package no.deichman.services.entity.external;

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

    public ExternalDataObject(String id, String prefLabel) {
        this();
        setId(id);
        setPrefLabel(prefLabel);
    }

    public ExternalDataObject(String id) {
        this();
        setId(id);
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

    @SerializedName("deichman:prefLabel")
    private String prefLabel;

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
        this.id = id;
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
