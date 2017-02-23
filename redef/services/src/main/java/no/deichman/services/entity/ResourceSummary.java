package no.deichman.services.entity;

import org.apache.commons.lang3.builder.EqualsBuilder;
import org.apache.commons.lang3.builder.HashCodeBuilder;

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

    @Override
    public final boolean equals(Object o) {
        if (this == o) {
            return true;
        }

        if (!(o instanceof ResourceSummary)) {
            return false;
        }

        ResourceSummary that = (ResourceSummary) o;

        return new EqualsBuilder()
                .append(uri, that.uri)
                .append(projections, that.projections)
                .isEquals();
    }

    @Override
    @SuppressWarnings("MagicNumber")
    public final int hashCode() {
        return new HashCodeBuilder(17, 37)
                .append(uri)
                .append(projections)
                .toHashCode();
    }
}
