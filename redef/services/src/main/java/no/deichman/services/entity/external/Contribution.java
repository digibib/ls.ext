package no.deichman.services.entity.external;

import com.google.gson.annotations.SerializedName;

import java.util.Map;

import static com.google.common.collect.ImmutableMap.of;

/**
 * Responsibility: provide contribution object.
 */
@SuppressWarnings("checkstyle:DesignForExtension")
public class Contribution extends ExternalDataObject {

    @SerializedName("deichman:agent")
    private Map<String, String> agent;

    @SerializedName("deichman:role")
    private ExternalDataObject role;

    public Contribution(Named contributor, String id) {
        agent = of("@id", contributor.getId());
        this.setId(id);
    }

    public Contribution() {

    }

    public Contribution(String id) {
        super(id);
    }

    @Override
    protected void assignType() {
        this.setType("deichman:Contribution");
    }

    public final Map<String, String> getAgent() {
        return agent;
    }

    public final void setAgent(Named agent) {
        this.agent = of("@id", agent.getId());
    }

    public final ExternalDataObject getRole() {
        return role;
    }

    public final void setRole(ExternalDataObject role) {
        this.role = role;
    }
}
