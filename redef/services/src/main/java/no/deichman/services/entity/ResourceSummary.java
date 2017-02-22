package no.deichman.services.entity;

import java.util.Map;

/**
 * Responsibility: provide summary or projection information about a resource.
 */
public class ResourceSummary {
    private String uri;
    private Map<String, String> projections;

    public ResourceSummary(String uri, Map<String, String> projections) {
        this.uri = uri;
        this.projections = projections;
    }

    public final String getUri() {
        return uri;
    }

    public final Map<String, String> getProjections() {
        return projections;
    }
}
