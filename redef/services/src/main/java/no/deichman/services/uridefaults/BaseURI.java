package no.deichman.services.uridefaults;

/**
 * Responsibility: Provide base-URIs.
 */
public final class BaseURI {
    private BaseURI() {
        // checkstyle need this
    }

    private static final String BASE_URI_ROOT = "http://data.deichman.no/";

    public static String root() {
        return BASE_URI_ROOT;
    }

    public static String work() {
        return BASE_URI_ROOT + "work/";
    }

    public static String ontology() {
        return BASE_URI_ROOT + "ontology#";
    }

    public static String role() {
        return BASE_URI_ROOT + "role#";
    }

    public static String ontology(String thing) {
        return BASE_URI_ROOT + "ontology#" + thing;
    }

    public static String publication() {
        return BASE_URI_ROOT + "publication/";
    }

    public static String person() {
        return BASE_URI_ROOT + "person/";
    }

    public static String values() {
        return BASE_URI_ROOT + "authorized_values/";
    }

    public static String exemplar() {
        return BASE_URI_ROOT + "exemplar/";
    }

    public static String place() {
        return BASE_URI_ROOT + "place/";
    }

    public static String corporation() {
        return BASE_URI_ROOT + "corporation/";
    }

    public static String serial() {
        return BASE_URI_ROOT + "serial/";
    }

    public static String subject() {
        return BASE_URI_ROOT + "subject/";
    }

    public static String genre() {
        return BASE_URI_ROOT + "genre/";
    }

    public static String instrument() {
        return BASE_URI_ROOT + "instrument/";
    }

    public static String compositionType() {
        return BASE_URI_ROOT + "compositionType/";
    }

    public static String event() {
        return BASE_URI_ROOT + "event/";
    }

    public static String workSeries() {
        return BASE_URI_ROOT + "workSeries/";
    }

    public static String cataloguingSource(String source) {
        return BASE_URI_ROOT + "cataloguingSource#" + source;
    }
}
