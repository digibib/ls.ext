package no.deichman.services.entity.z3950;

import org.junit.Test;

import java.util.HashMap;
import java.util.Map;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

/**
 * Responsibility: test Contribution class.
 */
public class ContributionTest {

    @Test
    public void test_default_constructor() {
        assertNotNull(new Contribution());
    }

    @Test
    public void test_can_set_and_get_agent() throws Exception {
        Contribution contribution = new Contribution();
        String testData = "_:123123123";
        Map<String, String> map = new HashMap<>();
        map.put("@id", testData);
        contribution.setAgent(map);
        assertEquals(map, contribution.getAgent());
    }
}
