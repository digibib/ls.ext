package no.deichman.services.utils;

import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExpectedException;

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

/**
 * Responsibility: unit test ModelToIndexMapper. See *ModelToIndexMapperTest files for tests of specific types.
 */
public class ResourceReaderTest {
    @Rule
    public ExpectedException expectedEx = ExpectedException.none();

    @Test
    public void should_have_default_constructor() {
        new ResourceReader();
    }

    @Test
    public void should_read_resource_file_as_string() {
        String fileContents = new ResourceReader().readFile("ontology.ttl");
        assertNotNull(fileContents); //Testing with arbitrary existing file that has content
        assertTrue(fileContents.length() > 0);
    }

    @Test
    public void should_throw_runtime_exception_on_non_existant_file() {
        expectedEx.expect(RuntimeException.class);
        expectedEx.expectMessage("Could not load file: NONEXISTANT.TEST");
        new ResourceReader().readFile("NONEXISTANT.TEST");
    }
}
