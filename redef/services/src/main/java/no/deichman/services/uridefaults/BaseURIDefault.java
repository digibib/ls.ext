package no.deichman.services.uridefaults;

/**
 * Responsibility: TODO.
 */
public class BaseURIDefault implements BaseURI {

    public final String getBaseURI() {
        return System.getenv("DATA_BASEURI");
    }

    public final String getWorkURI() {
        return getBaseURI() + "work/";
    }

    public final String getOntologyURI() {
        return getBaseURI() + "ontology#";
    }

    public final String getPublicationURI() {
        return getBaseURI() + "publication/";
    }
}
