package no.deichman.services.entity.z3950;

import org.junit.Test;

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

/**
 * Responsibility: Test target enums.
 */
public class TargetTest {
    @Test
    public void test_values_are_returned() {
        assertNotNull(Target.values());
    }

    @Test
    public void test_expected_values_are_returned() {

        for (Target value : Target.values()) {
            assertTrue(value.getDatabaseName().matches("(bibbi|loc|dfb)"));
        }
    }
}
