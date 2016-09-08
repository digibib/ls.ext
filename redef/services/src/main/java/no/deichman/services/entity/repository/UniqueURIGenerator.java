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

    UniqueURIGenerator() {

    }

    private String getRandom() {
        return RandomStringUtils.randomNumeric(NO_OF_DIGITS);
    }

    private String buildUri(String type, String uniquePart) {
        String result;
        switch (type) {
            case "Work":        result = BaseURI.work() + "w" + uniquePart;
                break;
            case "Publication": result = BaseURI.publication() + "p" + uniquePart;
                break;
            case "Person": result = BaseURI.person() + "h" + uniquePart;
                break;
            case "Place": result = BaseURI.place() + "g" + uniquePart;
                break;
            case "Corporation": result = BaseURI.corporation() + "c" + uniquePart;
                break;
            case "Serial": result = BaseURI.serial() + "s" + uniquePart;
                break;
            case "Subject": result = BaseURI.subject() + "e" + uniquePart;
                break;
            case "Genre": result = BaseURI.genre() + "m" + uniquePart;
                break;
            case "Instrument": result = BaseURI.instrument() + "i" + uniquePart;
                break;
            case "CompositionType": result = BaseURI.compositionType() + "t" + uniquePart;
                break;
            case "Event": result = BaseURI.event() + "v" + uniquePart;
                break;
            default:
                throw new IllegalArgumentException("Unknown URI-type " + type);
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
