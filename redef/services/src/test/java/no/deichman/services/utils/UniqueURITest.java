package no.deichman.services.utils;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import org.junit.Before;
import org.junit.Test;

import no.deichman.services.repository.RepositoryInMemory;

public class UniqueURITest {

    private UniqueURI randomString;

    @Before
    public void setUp() throws Exception {
        randomString = new UniqueURIMock();
    }

    @Test
    public void should_return_new_work_ID() {
        String uri = randomString.getNewURI("work", new RepositoryInMemory());
        assertNotNull(uri);
        assertTrue(uri.contains("/work"));
    }

    @Test
    public void should_return_new_publication_ID() {
        String uri = randomString.getNewURI("publication", new RepositoryInMemory());
        assertNotNull(uri);
        assertTrue(uri.contains("/publication"));
    }

    @Test
    public void shouldReturnThatIDisAvailable() {
        String test = "http://deichman.no/work/work_00009";
        assertFalse(randomString.checkResourceExistence(test, new RepositoryInMemory()));
    }

    @Test
    public void shouldReturnThatIDisNotAvailable() {
        String test = "http://deichman.no/work/work_00001";
        assertTrue(randomString.checkResourceExistence(test, new RepositoryInMemory()));
    }

}
