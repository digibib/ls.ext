package no.deichman.services.entity.patch;

import com.google.gson.Gson;
import com.google.gson.JsonElement;
import com.google.gson.JsonParser;
import com.google.gson.reflect.TypeToken;
import com.hp.hpl.jena.vocabulary.XSD;
import org.junit.Test;

import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

public class PatchParserTest {

    public static final String ADD_OPERATION = "add";

    @Test
    public void it_exists(){
        assertNotNull(new PatchParser());
    }

    @Test
    public void it_sets_gets_input_data(){
        PatchParser pp = new PatchParser();
        String input = "{\"one\":\"one\"}";
        pp.setPatchData(input);
        assertEquals(input, pp.getPatchInput());
    }

    @Test
    public void it_returns_list_of_patch_objects() throws PatchParserException{
        PatchObject po = new PatchObject();
        po.setOperation(ADD_OPERATION);
        po.setSubject("http://example.com/s");
        po.setPredicate("http://example.com/a");
        po.setObjectValue("Housec");
        String input = "{"
                     + "  \"op\":\"" + ADD_OPERATION + "\","
                     + "  \"s\":\"http://example.com/s\","
                     + "  \"p\":\"http://example.com/a\","
                     + "  \"o\":{\"value\":\"Housec\"}"
                     + "}";

        PatchParser pp = new PatchParser(input);
        pp.parsePatch();
        List<PatchObject> list = pp.getRawPatchObject();

        assertEquals(list.get(0).getObjectValue(),po.getObjectValue());
        assertEquals(list.get(0).getSubject(),po.getSubject());
        assertEquals(list.get(0).getPredicate(),po.getPredicate());
        assertEquals(list.get(0).getObject(),po.getObject());
    }

    @Test
    public void test_can_parse_plain_literal_data() throws PatchParserException{
        List<PatchObject> expected = new ArrayList<>();
        PatchObject po = new PatchObject();
        po.setOperation(ADD_OPERATION);
        po.setSubject("http://example.com/a");
        po.setPredicate("http://example.com/title");
        po.setObjectValue("Housea");
        expected.add(po);
        String data = "{"
                    + "  \"op\":\"" + ADD_OPERATION + "\","
                    + "  \"s\":\"http://example.com/a\","
                    + "  \"p\":\"http://example.com/title\","
                    + "  \"o\":{\"value\":\"Housea\"}"
                    + "}";

        PatchParser p = new PatchParser(data);
        List<PatchObject> t1 = p.parsePatch();

        assertEquals(t1.get(0).getObjectValue(), expected.get(0).getObjectValue());
    }

    @Test
    public void test_can_parse_lang_literal() throws PatchParserException{
        List<PatchObject> expected = new ArrayList<>();
        PatchObject po = new PatchObject();
        po.setOperation(ADD_OPERATION);
        po.setSubject("http://example.com/a");
        po.setPredicate("http://example.com/title");
        Map<String,String> object = new HashMap<>();
        object.put("value", "House");
        object.put("lang", "en");
        po.setObject(object);
        expected.add(po);
        String data2 = "{"
                     + "  \"op\":\"" + ADD_OPERATION + "\","
                     + "  \"s\":\"http://example.com/a\","
                     + "  \"p\":\"http://example.com/title\","
                     + "  \"o\": {"
                     + "           \"value\":\"House\","
                     + "           \"lang\":\"en\""
                     + "         }"
                     + "}";

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

    @Test
    public void test_parse_uri_object() throws PatchParserException {
        List<PatchObject> expected = new ArrayList<>();
        PatchObject po = new PatchObject();
        Map<String,String> object = new HashMap<>();
        String aXSDanyURI = XSD.anyURI.getURI();
        object.put("type", aXSDanyURI);
        object.put("value", "http://example.com/test_parse_uri_object");
        po.setOperation(ADD_OPERATION);
        po.setSubject("http://example.com/a");
        po.setPredicate("http://example.com/predicate");
        po.setObject(object);
        expected.add(po);

        String testData = "{"
                + "  \"op\":\"" + ADD_OPERATION + "\","
                + "  \"s\":\"http://example.com/a\","
                + "  \"p\":\"http://example.com/predicate\","
                + "  \"o\": {"
                + "           \"value\":\"http://example.com/test_parse_uri_object\","
                + "           \"type\":\"" + aXSDanyURI + "\""
                + "         }"
                + "}";

        PatchParser patchParser = new PatchParser(testData);
        List<PatchObject> lpo = patchParser.parsePatch();
        Type type = new TypeToken<List<PatchObject>>(){}.getType();
        Gson gson = new Gson();
        String source = gson.toJson(lpo, type);
        String target = gson.toJson(expected,type);
        JsonParser parser = new JsonParser();
        JsonElement l1 = parser.parse(source);
        JsonElement l2 = parser.parse(target);

        assertEquals(l1,l2);
    }
}
