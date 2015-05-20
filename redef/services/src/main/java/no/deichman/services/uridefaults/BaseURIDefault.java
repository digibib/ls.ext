package no.deichman.services.uridefaults;

public class BaseURIDefault implements BaseURI {

	public static String getBaseURI() {
		return System.getenv("DATA_BASEURI");
	}

	public static String getWorkURI() {
		return getBaseURI() + "work/";
	}

}
