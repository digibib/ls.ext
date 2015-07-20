package no.deichman.services.utils;

import no.deichman.services.repository.Repository;
import no.deichman.services.uridefaults.BaseURIMock;
import org.apache.commons.lang3.RandomStringUtils;

public class UniqueURIMock implements UniqueURI {

    private String getRandom() {
        return RandomStringUtils.randomNumeric(12);
    }

    private String getRandom(String type) {
        String random;
        BaseURIMock bum = new BaseURIMock();
        switch (type) {
            case "work":        random = bum.getWorkURI() + "w" + getRandom();
                                break;
            case "publication": random = bum.getPublicationURI() + "p" + getRandom();
            break;
            default:            random = null;
                                break;
        }

        if (random == null) {
            throw new IllegalArgumentException("Unknown URI-type");
        }

        return random;

    }

    @Override
    public String getNewURI(String type, Repository repository) {
        String random = null;
        boolean exists = true;

        while (exists) {
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
