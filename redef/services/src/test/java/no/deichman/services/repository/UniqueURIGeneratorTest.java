package no.deichman.services.repository;

import no.deichman.services.uridefaults.BaseURIMock;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import org.junit.Before;
import org.junit.Test;

public class UniqueURIGeneratorTest {

    private UniqueURIGenerator uriGenerator;

    @Before
    public void setUp() throws Exception {
        uriGenerator = new UniqueURIGenerator(new RepositoryInMemory(), new BaseURIMock());
    }

    @Test
    public void should_return_new_work_ID() {
        String uri = uriGenerator.getNewURI("work");
        assertNotNull(uri);
        assertTrue(uri.contains("/work"));
    }

    @Test
    public void should_return_new_publication_ID() {
        String uri = uriGenerator.getNewURI("publication");
        assertNotNull(uri);
        assertTrue(uri.contains("/publication"));
    }
}
