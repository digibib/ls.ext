package no.deichman.services.utils;

import no.deichman.services.repository.Repository;

public interface UniqueURI {
	
	Repository repository = null;
	String getNewURI(String type, Repository repository);
	boolean checkResourceExistence(String random, Repository repository);
}
