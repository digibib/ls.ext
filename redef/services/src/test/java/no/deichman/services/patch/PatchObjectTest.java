package no.deichman.services.patch;

import static org.junit.Assert.assertEquals;

import java.util.HashMap;
import java.util.Map;

import org.junit.Test;

public class PatchObjectTest {

    private static final String operation = "add";
    private static final String subject = "http://www.example.com/subject";
    private static final String predicate = "http://www.example.com/predicate";
    private static final String uriObject = "http://www.example.com/object";
    private static final Map<String,String> object = new HashMap<String,String>();
    static {
    	object.put("value", uriObject);
    }
    private static final Map<String,String> datatype_object = new HashMap<String,String>();
    static {
    	datatype_object.put("value", uriObject);
    	datatype_object.put("datatype", "http://www.example.com/z");
    }
    private static final Map<String,String> language_literal = new HashMap<String,String>();
    static {
        language_literal.put("value", "Hypothesis");
        language_literal.put("lang", "en");
    }

    @Test
    public void test_can_get_set_operation(){
        PatchObject patchObject = new PatchObject();
        patchObject.setOperation(operation);
        assertEquals(operation,patchObject.getOperation());
    }

    @Test
    public void test_can_get_set_subject(){
        PatchObject patchObject = new PatchObject();
        patchObject.setSubject(subject);
        assertEquals(subject,patchObject.getSubject());
    }

    @Test
    public void test_can_get_set_predicate(){
        PatchObject patchObject = new PatchObject();
        patchObject.setPredicate(predicate);
        assertEquals(predicate,patchObject.getPredicate());
    }

    @Test
    public void test_can_get_set_uri_object(){
        PatchObject patchObject = new PatchObject();
        patchObject.setObjectValue(uriObject);
        assertEquals(object,patchObject.getObject());
    }

    @Test
    public void test_can_get_set_datatype_object(){
        PatchObject patchObject = new PatchObject();
        patchObject.setObject(datatype_object);
        assertEquals(datatype_object,patchObject.getObject());
    }

    @Test
    public void test_can_get_set_language_literal(){
        PatchObject patchObject = new PatchObject();
        patchObject.setObject(language_literal);
        assertEquals(language_literal,patchObject.getObject());
    }

    @Test
    public void test_can_get_object_value(){
        PatchObject patchObject = new PatchObject();
        patchObject.setObject(datatype_object);
        assertEquals(datatype_object.get("value"),patchObject.getObjectValue());
    }

    @Test
    public void test_can_set_object_value(){
        PatchObject patchObject = new PatchObject();
        patchObject.setObjectValue("Cases");
        assertEquals("Cases",patchObject.getObjectValue());
    }

    @Test
    public void test_can_get_object_datatype(){
        PatchObject patchObject = new PatchObject();
        patchObject.setObject(datatype_object);
        assertEquals(datatype_object.get("datatype"),patchObject.getObjectDatatype());
    }

    @Test
    public void test_can_get_object_language(){
        PatchObject patchObject = new PatchObject();
        patchObject.setObject(language_literal);
        assertEquals(language_literal.get("lang"),patchObject.getObjectLanguage());
    }
}