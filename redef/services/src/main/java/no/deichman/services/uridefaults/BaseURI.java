package no.deichman.services.uridefaults;

/**
 * Responsibility: Provide base-URIs.
 */
public final class BaseURI {

    private final String baseUriRoot;

    private BaseURI(String baseUriRoot) {
        this.baseUriRoot = baseUriRoot;
    }

    public static BaseURI local() {
        return new BaseURI("http://deichman.no/");
    }

    public static BaseURI remote() {
        return new BaseURI(System.getProperty("DATA_BASEURI"));
    }

    public String work() {
        return baseUriRoot + "work/";
    }

    public String ontology() {
        return baseUriRoot + "ontology#";
    }

    public String publication() {
        return baseUriRoot + "publication/";
    }

    public String values() {
        return baseUriRoot + "authorized_values/";
    }
}
