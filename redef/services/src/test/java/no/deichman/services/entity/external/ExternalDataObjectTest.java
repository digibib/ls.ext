package no.deichman.services.entity.external;

import org.junit.Test;

import static org.junit.Assert.assertNotNull;


/**
 * Responsibility: test external data object class.
 */
public class ExternalDataObjectTest {
    @Test
    public void test_constructor() {
        assertNotNull(new ExternalDataObject());
    }
}
