package no.deichman.services.patch;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.junit.Test;

import com.google.gson.Gson;
import com.google.gson.JsonElement;
import com.google.gson.JsonParser;
import com.google.gson.reflect.TypeToken;

import no.deichman.services.error.PatchParserException;

public class PatchProviderTest {

    @Test
    public void test_class_exists(){
        assertNotNull(new PatchParser());
    }

    @Test
    public void test_can_get_set_input_data(){
        String data = "this is a test";
        PatchParser p = new PatchParser();
        p.setPatchData(data);
        assertEquals(data,p.getPatchInput());
    }

    @Test
    public void test_can_parse_plain_literal_data() throws PatchParserException{
        List<PatchObject> expected = new ArrayList<PatchObject>();
        PatchObject po = new PatchObject();
        po.setOperation("add");
        po.setSubject("http://example.com/a");
        po.setPredicate("http://example.com/title");
        po.setObjectValue("Housea");
        expected.add(po);
        String data = "{\"op\":\"add\",\"s\":\"http://example.com/a\",\"p\":\"http://example.com/title\",\"o\":{\"value\":\"Housea\"}}";
        PatchParser p = new PatchParser(data);
        List<PatchObject> t1 = p.parsePatch();
        assertEquals(t1.get(0).getObjectValue(), expected.get(0).getObjectValue());
    }
    @Test
    public void test_can_parse_lang_literal() throws PatchParserException{
        List<PatchObject> expected = new ArrayList<PatchObject>();
        PatchObject po = new PatchObject();
        po.setOperation("add");
        po.setSubject("http://example.com/a");
        po.setPredicate("http://example.com/title");
        Map<String,String> object = new HashMap<String,String>();
        object.put("value","House");
        object.put("lang", "en");
        po.setObject(object);
        expected.add(po);
        String data2 = "{\"op\":\"add\",\"s\":\"http://example.com/a\",\"p\":\"http://example.com/title\",\"o\": {\"value\":\"House\",\"lang\":\"en\"}}";
        PatchParser p = new PatchParser(data2);
        List<PatchObject> l = p.parsePatch();
        Type type = new TypeToken<List<PatchObject>>(){}.getType();
        Gson gson = new Gson();
        String source = gson.toJson(l, type);
        String target = gson.toJson(expected,type);
        JsonParser parser = new JsonParser();
        JsonElement l1 = parser.parse(source);
        JsonElement l2 = parser.parse(target);
        assertEquals(l1,l2);
        
    }
}
