package no.deichman.services.entity.z3950;

import com.google.gson.annotations.SerializedName;

import java.util.Map;

/**
 * Responsibility: provide contribution object.
 */

public class Contribution extends ExternalDataObject {

    @SerializedName("deichman:agent")
    private Map<String, String> agent;

    @SerializedName("deichman:role")
    private ExternalDataObject role;

    Contribution() {
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

}
