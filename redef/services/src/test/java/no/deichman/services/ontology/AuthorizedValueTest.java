package no.deichman.services.ontology;

import org.junit.Assert;
import org.junit.Test;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Responsibility: Test AuthorizedValue.
 */
public class AuthorizedValueTest {

    private static final List<String> AUTHORIZED_VALUES = new ArrayList<>(Arrays.asList(
            "language",
            "format",
            "nationality",
            "literaryForm",
            "audience",
            "biography",
            "formatAdaptation",
            "contentAdaptation",
            "binding",
            "writingSystem",
            "illustrativeMatter",
            "role",
            "mediaType",
            "relationType",
            "classificationSource",
            "key",
            "workType",
            "fictionNonfiction",
            "cataloguingSource"));

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
        int length = AUTHORIZED_VALUES.size();
        Assert.assertFalse("Authorized values contains untested values", length < AuthorizedValue.values().length);
        Assert.assertFalse("Authorized values does not contain all expected values", length > AuthorizedValue.values().length);
    }

}
