package no.deichman.services.uridefaults;

/**
 * Responsibility: Provide base-URIs.
 */
public final class BaseURI {

    public static final String LOCAL_BASE_URI_ROOT = "http://deichman.no/";

    private final String baseUriRoot;

    private BaseURI(String baseUriRoot) {
        this.baseUriRoot = baseUriRoot;
    }

    public static BaseURI local() {
        return new BaseURI(LOCAL_BASE_URI_ROOT);
    }

    public static BaseURI remote() {
        return new BaseURI(System.getProperty("DATA_BASEURI", "http://192.168.50.12:8005/"));
    }

    public String work() {
        return baseUriRoot + "work/";
    }

    public String ontology() {
        return baseUriRoot + "ontology#";
    }

    public String ontology(String thing) {
        return baseUriRoot + "ontology#" + thing;
    }

    public String publication() {
        return baseUriRoot + "publication/";
    }

    public String person() {
        return baseUriRoot + "person/";
    }

    public String values() {
        return baseUriRoot + "authorized_values/";
    }

    public String ui() {
        return baseUriRoot + "ui#";
    }

    public String exemplar() {
        return baseUriRoot + "exemplar/";
    }

    public String placeOfPublication() {
        return baseUriRoot + "placeOfPublication/";
    }

    public String publisher() {
        return baseUriRoot + "publisher/";
    }
}
