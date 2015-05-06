package no.deichman.services.utils;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import org.junit.Before;
import org.junit.Test;

import no.deichman.services.repository.RepositoryInMemory;


public class RandomStringDefaultTest {

    private RandomString randomString;
    
    @Before
    public void setUp() throws Exception {
        randomString = new RandomStringDefault();
    }

	@Test
	public void shouldReturnNewID() {
		assertNotNull(randomString.getNewURI("work", new RepositoryInMemory()));
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
