package no.deichman.services.entity;

import org.apache.jena.rdf.model.Literal;
import org.apache.jena.rdf.model.Resource;

/**
 * Responsibility: wrap data about a resources's participation on relationships with others.
 */
public final class Relationship {
    private String relationshipType;
    private String mainTitle;
    private String subtitle;
    private String partTitle;
    private String partNumber;
    private String prefLabel;
    private String targetType;
    private String publicationYear;
    private String alternativeName;
    private String targetUri;

    public String getRelationshipType() {
        return relationshipType;
    }

    public void setRelationshipType(Resource relationshipType) {
        this.relationshipType = relationshipType.getURI();
    }

    public String getMainTitle() {
        return mainTitle;
    }

    public void setMainTitle(String mainTitle) {
        this.mainTitle = mainTitle;
    }

    public String getSubtitle() {
        return subtitle;
    }

    public void setSubtitle(Literal subTitle) {
        this.subtitle = subTitle.getString();
    }

    public String getPartTitle() {
        return partTitle;
    }

    public void setPartTitle(Literal partTitle) {
        this.partTitle = partTitle.getString();
    }

    public String getPartNumber() {
        return partNumber;
    }

    public void setPartNumber(Literal partNumber) {
        this.partNumber = partNumber.getString();
    }

    public String getPrefLabel() {
        return prefLabel;
    }

    public void setPrefLabel(Literal prefLabel) {
        this.prefLabel = prefLabel.getString();
    }

    public String getTargetType() {
        return targetType;
    }

    public void setTargetType(Resource targetType) {
        this.targetType = targetType.getLocalName();
    }

    public String getPublicationYear() {
        return publicationYear;
    }

    public void setPublicationYear(Literal publicationYear) {
        this.publicationYear = publicationYear.getString();
    }

    public void setAlternativeName(Literal literal) {
        this.alternativeName = literal.getString();
    }

    public String getAlternativeName() {
        return alternativeName;
    }

    public void setTargetUri(Resource resource) {
        this.targetUri = resource.getURI();
    }

    public String getTargetUri() {
        return targetUri;
    }
}
