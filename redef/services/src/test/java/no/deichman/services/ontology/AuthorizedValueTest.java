package no.deichman.services.ontology;

import org.junit.Assert;
import org.junit.Test;

/**
 * Responsibility: Test AuthorizedValue.
 */
public class AuthorizedValueTest {

    private static final String[] AUTHORIZED_VALUES = new String[]{
            "language",
            "format",
            "nationality",
            "literaryForm",
            "audience",
            "biography",
            "adaptationOfPublicationForParticularUserGroups",
            "adaptationOfWorkForParticularUserGroups",
            "binding",
            "writingSystem",
            "illustrativeMatter",
            "role",
            "mediaType"};

    @Test
    public void test_all_types_pattern_is_available() {

        String allAuthorizedValuesPattern = "(" + String.join("|", AUTHORIZED_VALUES) + ")";
        Assert.assertEquals(allAuthorizedValuesPattern, AuthorizedValue.ALL_TYPES_PATTERN);
    }

    @Test
    public void test_enum_contains_expected_values() {
        for (String authorizedValue : AUTHORIZED_VALUES) {
            Assert.assertNotNull(AuthorizedValue.get(authorizedValue));
        }

    }

    @Test
    public void test_enum_does_not_contain_other_values() {
        int length = AUTHORIZED_VALUES.length;
        Assert.assertFalse("Authorized values contains untested values", length < AuthorizedValue.values().length);
        Assert.assertFalse("Authorized values does not contain all expected values", length > AuthorizedValue.values().length);
    }

}
