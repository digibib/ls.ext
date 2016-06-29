package no.deichman.services.entity.z3950;

import org.junit.Test;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;


/**
 * Responsibility: test external data object class.
 */
public class ExternalDataObjectTest {
    @Test
    public void test_constructor() {
        assertNotNull(new ExternalDataObject());
    }

    @Test
    public void test_bnodization() {
        ExternalDataObject edo = new ExternalDataObject();
        String id1 = "_:00000012";
        String id2 = "00000023";
        assertEquals(id1, edo.bNodize(id1));
        assertEquals("_:" + id2, edo.bNodize(id2));
    }
}
