package no.deichman.services.uridefaults;

/**
 * Responsibility: TODO.
 */
public final class BaseURIDefault extends BaseURI {

    public String getBaseURI() {
        return System.getProperty("DATA_BASEURI");
    }

}
