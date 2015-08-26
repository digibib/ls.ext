package no.deichman.services.entity.repository;

import no.deichman.services.uridefaults.BaseURI;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import org.junit.Before;
import org.junit.Test;

public class UniqueURIGeneratorTest {

    private UniqueURIGenerator uriGenerator;

    @Before
    public void setUp() throws Exception {
        uriGenerator = new UniqueURIGenerator(BaseURI.local());
    }

    @Test
    public void should_return_new_work_ID() {
        String uri = uriGenerator.getNewURI("work", s -> false);
        assertNotNull(uri);
        assertTrue(uri.contains("/work"));
    }

    @Test
    public void should_return_new_publication_id_even_if_first_attempt_fails() {
        boolean[] existsFlag = new boolean[1];
        existsFlag[0] = true;
        String uri = uriGenerator.getNewURI(
                "publication",
                s -> {
                    boolean result = existsFlag[0];
                    existsFlag[0] = false;
                    return result;
                }
        );
        assertNotNull(uri);
        assertTrue(uri.contains("/publication"));
    }
}
