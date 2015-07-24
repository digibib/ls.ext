package no.deichman.services.utils;

import no.deichman.services.repository.Repository;
import no.deichman.services.uridefaults.BaseURI;
import org.apache.commons.lang3.RandomStringUtils;

public class UniqueURI {

    public static final int NO_OF_DIGITS = 12;

    private String getRandom() {
        return RandomStringUtils.randomNumeric(NO_OF_DIGITS);
    }

    private String getRandom(String type, BaseURI baseURI) {
        String random;
        switch (type) {
            case "work":        random = baseURI.getWorkURI() + "w" + getRandom();
                break;
            case "publication": random = baseURI.getPublicationURI() + "p" + getRandom();
                break;
            default:            random = null;
                break;
        }

        if (random == null) {
            throw new IllegalArgumentException("Unknown URI-type");
        }
        return random;

    }

    public String getNewURI(String type, Repository repository, BaseURI baseURI) {
        String random = null;
        boolean exists = true;

        while (exists) {
            random = getRandom(type, baseURI);
            exists = checkResourceExistence(random, repository);
        }
        return random;

    }

    boolean checkResourceExistence(String random, Repository repository) {
        return repository.askIfResourceExists(random);
    }

}
