package no.deichman.services.entity.repository;

import org.junit.Before;
import org.junit.Test;

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

public class UniqueURIGeneratorTest {

    public static final String PERSON_IDENTIFIER_REGEX = "h[0-9]+";
    public static final String PUBLICATION_IDENTIFIER_REGEX = "p[0-9]+";
    public static final String WORK_IDENTIFIER_REGEX = "w[0-9]+";
    public static final String PLACE_IDENTIFIER_REGEX = "g[0-9]+";
    private UniqueURIGenerator uriGenerator;

    @Before
    public void setUp() throws Exception {
        uriGenerator = new UniqueURIGenerator();
    }

    @Test
    public void should_return_new_work_ID() throws Exception {
        String uri = uriGenerator.getNewURI("Work", s -> false);
        assertNotNull(uri);
        assertTrue(uri.contains("/work"));
        assertTrue(getLastElementOfURI(uri).matches(WORK_IDENTIFIER_REGEX));
    }

    @Test
    public void should_return_new_publication_id_even_if_first_attempt_fails() throws Exception {
        boolean[] existsFlag = new boolean[1];
        existsFlag[0] = true;
        String uri = uriGenerator.getNewURI(
                "Publication",
                s -> {
                    boolean result = existsFlag[0];
                    existsFlag[0] = false;
                    return result;
                }
        );
        assertNotNull(uri);
        assertTrue(uri.contains("/publication"));
        assertTrue(getLastElementOfURI(uri).matches(PUBLICATION_IDENTIFIER_REGEX));
    }

    @Test
    public void should_get_new_person_id() throws Exception {
        String uri = uriGenerator.getNewURI("Person", s -> false);
        assertNotNull(uri);
        assertTrue(uri.contains("/person"));
        assertTrue(getLastElementOfURI(uri).matches(PERSON_IDENTIFIER_REGEX));
    }

    @Test
    public void should_get_new_place_id() throws Exception {
        String uri = uriGenerator.getNewURI("Place", s -> false);
        assertNotNull(uri);
        assertTrue(uri.contains("/place"));
        assertTrue(getLastElementOfURI(uri).matches(PLACE_IDENTIFIER_REGEX));
    }

    private String getLastElementOfURI(String uri) {
        return uri.substring(uri.lastIndexOf("/") + 1);
    }
}
