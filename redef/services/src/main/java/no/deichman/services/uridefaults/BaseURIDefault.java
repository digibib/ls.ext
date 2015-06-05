package no.deichman.services.uridefaults;

public class BaseURIDefault implements BaseURI {

	private static String getBaseURI() {
		return System.getenv("DATA_BASEURI");
	}

	public static String getWorkURI() {
		return getBaseURI() + "work/";
	}

	public static String getOntologyURI() {
		// TODO Auto-generated method stub
		return getBaseURI() + "ontology#";
	}

}
