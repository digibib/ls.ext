package no.deichman.services.entity.external;

import org.junit.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

/**
 * Responsibility: Test result class.
 */
public class ResultTest {
    @Test
    public void test_default_constructor() {
        assertNotNull(new Result());
    }

    @Test
    public void test_fields_present() {
        String sourceName = "bibbi";
        String testHit = "Test data";
        List<Object> hits = new ArrayList<>();
        hits.add(testHit);

        Result result = new Result();

        result.setSource(sourceName);
        result.setHits(hits);

        assertEquals(sourceName, result.getSource());
        assertEquals(hits, result.getHits());
    }
}
