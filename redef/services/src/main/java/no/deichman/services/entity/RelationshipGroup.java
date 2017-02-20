package no.deichman.services.entity;

import java.util.List;
import java.util.Map;

import static com.google.common.collect.Lists.newArrayList;

/**
 * Responsibility: wrap group of relations of common type e.g. "as Subject of"
 */
public final class RelationshipGroup {
    private String relationshipType;
    private List<Relationship> relationships = newArrayList();

    public RelationshipGroup(Map.Entry<String, List<Relationship>> relationships) {
        this.relationshipType = relationships.getKey();
        this.relationships = relationships.getValue();
    }

    public RelationshipGroup() {
    }

    public String getRelationshipType() {
        return relationshipType;
    }

    public List<Relationship> getRelationships() {
        return relationships;
    }

    public void add(Relationship relationship) {
        relationships.add(relationship);
    }
}
