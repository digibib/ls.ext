package no.deichman.services.error;

import static org.junit.Assert.assertEquals;

import org.junit.Test;

public class PatchExceptionTest {

    @Test
    public void test_patch_exception() {
        String message = "qpple";
        assertEquals(message, new PatchException(message).getMessage());
    }

}
