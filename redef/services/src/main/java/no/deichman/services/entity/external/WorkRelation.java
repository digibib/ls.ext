package no.deichman.services.entity.external;

import com.google.gson.annotations.SerializedName;

import java.util.Map;

import static com.google.common.collect.ImmutableMap.of;

/**
 * Responsibility: map work relation.
 */
public class WorkRelation {
    @SerializedName("@type")
    private final String type = "deichman:WorkRelation";

    @SerializedName("deichman:hasRelationType")
    private final Map<String, String> relationshipType;

    @SerializedName("@id")
    private String id;

    @SerializedName("deichman:work")
    private final Map<String, String> otherWorkId;

    WorkRelation(String id, String otherWorkId, String relationshipType) {
        this.id = id;
        this.otherWorkId = of("@id", otherWorkId);
        this.relationshipType = of("@id", relationshipType);
    }

    public final String getId() {
        return id;
    }
}
