package no.deichman.services.uridefaults;

public class BaseURIDefault implements BaseURI {

    public String getBaseURI() {
        return System.getenv("DATA_BASEURI");
    }

    public String getWorkURI() {
        return getBaseURI() + "work/";
    }

    public String getOntologyURI() {
        return getBaseURI() + "ontology#";
    }

}
