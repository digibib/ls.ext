package no.deichman.services.utils;

import no.deichman.services.repository.Repository;
import org.apache.commons.lang3.RandomStringUtils;

public class RandomStringDefault implements RandomString {
	

	private String getRandom() {
		
		String random = RandomStringUtils.randomNumeric(12);
		return random;
	}
	
	private String getRandom(String type) {
		String random = new String();
		
		switch (type) {
		    case "work": random = "http://deichman.no/work/w" + getRandom();
		                 break;
		    default:     random = null;
		                 break;
		}
		
		if (random == null) {
			throw new IllegalArgumentException("Unknown URI-type");
		}
		
		return random;

	}

	@Override
	public String getNewURI(String type, Repository repository) {
		String random = new String();
		boolean exists = true;

		while (exists != false) {
			random = getRandom(type);
			exists = checkResourceExistence(random, repository);
		}
		
		return random;

	}

	@Override
	public boolean checkResourceExistence(String random, Repository repository) {
		
		return repository.askIfResourceExists(random);
	}

}
