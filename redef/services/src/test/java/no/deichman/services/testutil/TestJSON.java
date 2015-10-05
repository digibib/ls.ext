package no.deichman.services.testutil;


import static org.junit.Assert.assertTrue;

import java.io.IOException;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Responsibility: JSON test tool.
 */
public final class TestJSON {

    private TestJSON() { }

    public static void assertValidJSON(String string) {
        assertTrue(isValidJSON(string));
    }

    @SuppressWarnings("PMD.EmptyWhileStmt")
    private static boolean isValidJSON(final String json) {
        boolean valid = false;
        try {
            final JsonParser parser = new ObjectMapper().getJsonFactory().createJsonParser(json);
            while (parser.nextToken() != null) {
                  // NOOP
            }
            valid = true;
        } catch (IOException ioe) {
            ioe.printStackTrace();
        }

        return valid;
    }

}
