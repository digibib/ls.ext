package no.deichman.services.entity;

import org.junit.Assert;
import org.junit.Test;

/**
 * Responsibility: Test EntityType.
 */
public class EntityTypeTest {

    private static final String[] ENTITIES = new String[]{"work", "publication", "person", "place", "corporation", "serial", "subject", "genre"};

    @Test
    public void test_all_types_pattern_is_available() {

        String allEntityPathsPattern = "(" + String.join("|", ENTITIES) + ")";
        Assert.assertEquals(allEntityPathsPattern, EntityType.ALL_TYPES_PATTERN);
    }

    @Test
    public void test_enum_contains_expected_values() {
        for (String entityType : ENTITIES) {
            Assert.assertNotNull(EntityType.get(entityType));
        }

    }

}
