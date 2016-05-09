package no.deichman.services.entity.repository;

import no.deichman.services.uridefaults.BaseURI;
import no.deichman.services.uridefaults.XURI;
import org.apache.commons.lang3.RandomStringUtils;

import java.util.function.Predicate;

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
            case "Work":        result = baseURI.work() + "w" + uniquePart;
                break;
            case "Publication": result = baseURI.publication() + "p" + uniquePart;
                break;
            case "Person": result = baseURI.person() + "h" + uniquePart;
                break;
            case "Place": result = baseURI.place() + "g" + uniquePart;
                break;
            case "Publisher": result = baseURI.publisher() + "i" + uniquePart;
                break;
            case "Serial": result = baseURI.serial() + "s" + uniquePart;
                break;
            case "Subject": result = baseURI.subject() + "e" + uniquePart;
                break;
            case "Genre": result = baseURI.genre() + "m" + uniquePart;
                break;
            default:            throw new IllegalArgumentException("Unknown URI-type " + type);
        }
        return result;
    }

    String getNewURI(String type, Predicate<XURI> existsChecker) throws Exception {
        String random = null;
        boolean exists = true;

        while (exists) {
            random = buildUri(type, getRandom());
            exists = existsChecker.test(new XURI(random));
        }
        return random;
    }

}
