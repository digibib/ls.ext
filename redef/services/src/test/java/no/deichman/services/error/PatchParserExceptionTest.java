package no.deichman.services.error;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

import org.junit.Test;

public class PatchParserExceptionTest {
    @Test
    public void test_can_have_message(){
        String message = "hello";
        assertNotNull(new PatchParserException(message));
        assertEquals(message, new PatchParserException(message).getMessage());
    }
}
