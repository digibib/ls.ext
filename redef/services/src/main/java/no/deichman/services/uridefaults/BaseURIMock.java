package no.deichman.services.uridefaults;

public class BaseURIMock implements BaseURI {

    public String getBaseURI() {
        return "http://deichman.no/";
    }

    public String getWorkURI() {
        return getBaseURI() + "work/";
    }

    public String getOntologyURI() {
        return getBaseURI() + "ontology#";
    }
}
