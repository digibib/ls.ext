package no.deichman.services.uridefaults;

/**
 * Responsibility: Provide base-URIs.
 */
public final class BaseURI {

    private final String baseURI;

    private BaseURI(String baseURI) {
        this.baseURI = baseURI;
    }

    public static BaseURI local() {
        return new BaseURI("http://deichman.no/");
    }

    public static BaseURI remote() {
        return new BaseURI(System.getProperty("DATA_BASEURI"));
    }

    public String work() {
        return baseURI + "work/";
    }

    public String ontology() {
        return baseURI + "ontology#";
    }

    public String publication() {
        return baseURI + "publication/";
    }
}
