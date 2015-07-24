package no.deichman.services.uridefaults;

/**
 * Responsibility: TODO.
 */
public abstract class BaseURI {

    abstract String getBaseURI();

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
