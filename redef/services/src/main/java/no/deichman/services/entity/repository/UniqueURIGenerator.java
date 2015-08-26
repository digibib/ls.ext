package no.deichman.services.entity.repository;

import java.util.function.Predicate;
import no.deichman.services.uridefaults.BaseURI;
import org.apache.commons.lang3.RandomStringUtils;

/**
 * Responsibility: TODO.
 */
class UniqueURIGenerator {

    private static final int NO_OF_DIGITS = 12;
    private BaseURI baseURI;

    UniqueURIGenerator(BaseURI baseURI) {
        this.baseURI = baseURI;
    }

    private String getRandom() {
        return RandomStringUtils.randomNumeric(NO_OF_DIGITS);
    }

    private String buildUri(String type, String uniquePart) {
        String result;
        switch (type) {
            case "work":        result = baseURI.work() + "w" + uniquePart;
                break;
            case "publication": result = baseURI.publication() + "p" + uniquePart;
                break;
            default:            throw new IllegalArgumentException("Unknown URI-type");
        }
        return result;
    }

    String getNewURI(String type, Predicate<String> existsChecker) {
        String random = null;
        boolean exists = true;

        while (exists) {
            random = buildUri(type, getRandom());
            exists = existsChecker.test(random);
        }
        return random;
    }

}
