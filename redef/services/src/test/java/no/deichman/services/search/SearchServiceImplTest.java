package no.deichman.services.search;

import org.junit.Before;
import org.junit.Test;

/**
 * Responsibility: unit test SearchServiceImpl.
 */
public class SearchServiceImplTest {

    public static final String INVALID_URL = "http://";
    public static final String VALID_URL = "http://deichman.no/";

    @Before
    public void setUp() throws Exception {

    }

    @Test(expected = RuntimeException.class)
    public void testConstructorWithInvalidUrl_throwsException() {
        new SearchServiceImpl(INVALID_URL, null, null);
    }

    @Test
    public void testConstructor() {
        new SearchServiceImpl(VALID_URL, null, null);
    }
}
