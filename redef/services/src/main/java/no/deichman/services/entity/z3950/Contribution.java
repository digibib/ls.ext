package no.deichman.services.entity.z3950;

import com.google.gson.annotations.SerializedName;

import java.util.Map;

/**
 * Responsibility: provide contribution object.
 */
@SuppressWarnings("checkstyle:DesignForExtension")
public class Contribution extends ExternalDataObject {

    @SerializedName("deichman:agent")
    private Map<String, String> agent;

    @SerializedName("deichman:role")
    private ExternalDataObject role;
    @SerializedName("deichman:ordinal")
    private String ordinal;

    Contribution() {}

    @Override
    protected void assignType() {
        this.setType("deichman:Contribution");
    }

    public final Map<String, String> getAgent() {
        return agent;
    }

    public final void setAgent(Map<String, String> agent) {
        this.agent = agent;
    }

    public final ExternalDataObject getRole() {
        return role;
    }

    public final void setRole(ExternalDataObject role) {
        this.role = role;
    }

    public final void setOrdinal(String ordinal) {
        this.ordinal = ordinal;
    }
}
