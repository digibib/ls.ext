package no.deichman.services.uridefaults;

public class BaseURIMock implements BaseURI {

	public static String getBaseURI() {
		return "http://deichman.no/";
	}

	public static String getWorkURI() {
		return getBaseURI() + "work/";
	}

}
