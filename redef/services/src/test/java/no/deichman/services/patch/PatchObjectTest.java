package no.deichman.services.patch;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

import java.util.HashMap;
import java.util.Map;

import org.junit.Before;
import org.junit.Test;

import no.deichman.services.error.PatchParserException;

public class PatchObjectTest {

    private static final String ADD = "add";
    private static final String SUBJECT = "http://www.example.com/SUBJECT";
    private static final String PREDICATE = "http://www.example.com/PREDICATE";
    private static final String URI_OBJECT = "http://www.example.com/object";

    private Map<String, String> object;
    private Map<String, String> datatypeObject;
    private Map<String, String> languageLiteral;

    @Before
    public void setUp() {
        object = new HashMap<>();
        object.put("value", URI_OBJECT);

        datatypeObject = new HashMap<>();
        datatypeObject.put("value", URI_OBJECT);
        datatypeObject.put("datatype", "http://www.example.com/z");

        languageLiteral = new HashMap<>();
        languageLiteral.put("value", "Hypothesis");
        languageLiteral.put("lang", "en");
    }

    @Test
    public void test_can_get_set_operation() throws PatchParserException{
        PatchObject patchObject = new PatchObject();
        patchObject.setOperation(ADD);
        assertEquals(ADD, patchObject.getOperation());
    }

    @Test(expected = PatchParserException.class)
    public void test_getting_null_operation_fails() throws PatchParserException{
        new PatchObject().getOperation();
    }

    @Test(expected = PatchParserException.class)
    public void test_getting_null_subject_fails() throws PatchParserException{
        new PatchObject().getSubject();
    }

    @Test(expected = PatchParserException.class)
    public void test_getting_null_predicate_fails() throws PatchParserException{
        new PatchObject().getPredicate();
    }

    @Test(expected = PatchParserException.class)
    public void test_getting_null_object_fails() throws PatchParserException{
        new PatchObject().getObjectValue();
    }

    @Test(expected = PatchParserException.class)
    public void test_getting_null_to_patch() throws PatchParserException{
        new PatchObject().toPatch();
    }

    @Test
    public void test_can_get_set_subject() throws PatchParserException{
        PatchObject patchObject = new PatchObject();
        patchObject.setSubject(SUBJECT);
        assertEquals(SUBJECT, patchObject.getSubject());
    }

    @Test
    public void test_can_get_set_predicate() throws PatchParserException{
        PatchObject patchObject = new PatchObject();
        patchObject.setPredicate(PREDICATE);
        assertEquals(PREDICATE, patchObject.getPredicate());
    }

    @Test
    public void test_can_get_set_uri_object(){
        PatchObject patchObject = new PatchObject();
        patchObject.setObjectValue(URI_OBJECT);
        assertEquals(object, patchObject.getObject());
    }

    @Test
    public void test_can_get_set_datatype_object(){
        PatchObject patchObject = new PatchObject();
        patchObject.setObject(datatypeObject);
        assertEquals(datatypeObject, patchObject.getObject());
    }

    @Test
    public void test_can_get_set_language_literal(){
        PatchObject patchObject = new PatchObject();
        patchObject.setObject(languageLiteral);
        assertEquals(languageLiteral, patchObject.getObject());
    }

    @Test
    public void test_can_get_object_value() throws PatchParserException{
        PatchObject patchObject = new PatchObject();
        patchObject.setObject(datatypeObject);
        assertEquals(datatypeObject.get("value"), patchObject.getObjectValue());
    }

    @Test
    public void test_can_set_object_value() throws PatchParserException{
        PatchObject patchObject = new PatchObject();
        patchObject.setObjectValue("Cases");
        assertEquals("Cases", patchObject.getObjectValue());
    }

    @Test
    public void test_can_get_object_datatype(){
        PatchObject patchObject = new PatchObject();
        patchObject.setObject(datatypeObject);
        assertEquals(datatypeObject.get("datatype"), patchObject.getObjectDatatype());
    }

    @Test
    public void test_can_get_object_language(){
        PatchObject patchObject = new PatchObject();
        patchObject.setObject(languageLiteral);
        assertEquals(languageLiteral.get("lang"), patchObject.getObjectLanguage());
    }

    @Test
    public void test_can_convert_to_patch() throws PatchParserException{
        PatchObject patchObject = new PatchObject();
        patchObject.setSubject("http://example.org/work/w1");
        patchObject.setPredicate("http://example.org/ontology#title");
        patchObject.setObjectValue("Sult");
        assertNotNull(patchObject.toPatch());
    }
}
