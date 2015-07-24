package no.deichman.services.repository;

import no.deichman.services.uridefaults.BaseURI;
import org.apache.commons.lang3.RandomStringUtils;

class UniqueURI {

    private static final int NO_OF_DIGITS = 12;
    private Repository repository;
    private BaseURI baseURI;

    public UniqueURI(Repository repository, BaseURI baseURI) {
        this.repository = repository;
        this.baseURI = baseURI;
    }

    private String getRandom() {
        return RandomStringUtils.randomNumeric(NO_OF_DIGITS);
    }

    private String buildUri(String type, String uniquePart) {
        String result;
        switch (type) {
            case "work":        result = baseURI.getWorkURI() + "w" + uniquePart;
                break;
            case "publication": result = baseURI.getPublicationURI() + "p" + uniquePart;
                break;
            default:            throw new IllegalArgumentException("Unknown URI-type");
        }
        return result;
    }

    String getNewURI(String type) {
        String random = null;
        boolean exists = true;

        while (exists) {
            random = buildUri(type, getRandom());
            exists = repository.askIfResourceExists(random);
        }
        return random;
    }

}
