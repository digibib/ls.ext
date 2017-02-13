package no.deichman.services.entity;

import java.util.List;

import static com.google.common.collect.Lists.newArrayList;

/**
 * Responsibility: wrap group of relations of common type e.g. "as Subject of"
 */
public final class RelationshipGroup {
    private String relationshipType;
    private List<Relationship> relationships = newArrayList();

    public RelationshipGroup(String relationshipType) {
        this.relationshipType = relationshipType;
    }

    public RelationshipGroup() {
    }

    public RelationshipGroup(String relationshipLabel, Relationship firstRelationship) {
        this(relationshipLabel);
        relationships = newArrayList(firstRelationship);
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
