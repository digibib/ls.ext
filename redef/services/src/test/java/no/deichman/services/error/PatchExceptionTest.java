package no.deichman.services.error;

import static org.junit.Assert.assertNotNull;

import org.junit.Test;

public class PatchExceptionTest {

	@Test
	public void test_patch_exception() {
		assertNotNull(new PatchException("Error"));
	}

}
