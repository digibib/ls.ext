package no.deichman.services.ontology;

import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdf.model.ResourceFactory;

/**
 * Responsibility: represent the ontology as a java class so that we avoid using strings.
 */

class DEICHMAN {
    public static final String URI = "http://deichman.no/ontology#";

    public static String getURI() {
        return URI;
    }

    protected static Resource resource(String local) {
        return ResourceFactory.createResource(URI + local);
    }

    protected static Property property(String local) {
        return ResourceFactory.createProperty(URI + local);
    }

    public static final Resource Agent = resource("Agent");
    public static final Resource Concept = resource("Concept");
    public static final Resource Contribution = resource("Contribution");
    public static final Resource Corporation = resource("Corporation");
    public static final Resource Genre = resource("Genre");
    public static final Resource Issue = resource("Issue");
    public static final Resource MainEntry = resource("MainEntry");
    public static final Resource Person = resource("Person");
    public static final Resource Place = resource("Place");
    public static final Resource Publication = resource("Publication");
    public static final Resource Publisher = resource("Publisher");
    public static final Resource Role = resource("Role");
    public static final Resource Serial = resource("Serial");
    public static final Resource SerialIssue = resource("SerialIssue");
    public static final Resource Series = resource("Series");
    public static final Resource Subject = resource("Subject");
    public static final Resource Work = resource("Work");

    public static final Property adaptationOfPublicationForParticularUserGroups =
            property("adaptationOfPublicationForParticularUserGroups");
    public static final Property adaptationOfWorkForParticularUserGroups =
            property("adaptationOfWorkForParticularUserGroups");
    public static final Property agent = property("agent");
    public static final Property altLabel = property("altLabel");
    public static final Property audience = property("audience");
    public static final Property binding = property("binding");
    public static final Property biography = property("biography");
    public static final Property birthYear = property("birthYear");
    public static final Property contributor = property("contributor");
    public static final Property creator = property("creator");
    public static final Property deathYear = property("deathYear");
    public static final Property edition = property("edition");
    public static final Property format = property("format");
    public static final Property gender = property("gender");
    public static final Property genre = property("genre");
    public static final Property hasMediatype = property("hasMediatype");
    public static final Property hasPlaceOfPublication = property("hasPlaceOfPublication");
    public static final Property illustrativeMatter = property("illustrativeMatter");
    public static final Property inSerial = property("inSerial");
    public static final Property isbn = property("isbn");
    public static final Property issue = property("issue");
    public static final Property language = property("language");
    public static final Property literaryForm = property("literaryForm");
    public static final Property mainTitle = property("mainTitle");
    public static final Property name = property("name");
    public static final Property nationality = property("nationality");
    public static final Property numberOfPages = property("numberOfPages");
    public static final Property partNumber = property("partNumber");
    public static final Property partTitle = property("partTitle");
    public static final Property personTitle = property("personTitle");
    public static final Property prefLabel = property("prefLabel");
    public static final Property publicationYear = property("publicationYear");
    public static final Property publicationOf = property("publicationOf");
    public static final Property publishedBy = property("publishedBy");
    public static final Property recordID = property("recordID");
    public static final Property role = property("role");
    public static final Property serial = property("serial");
    public static final Property specification = property("specification");
    public static final Property subject = property("subject");
    public static final Property subtitle = property("subtitle");
    public static final Property writingSystem = property("writingSystem");

}
