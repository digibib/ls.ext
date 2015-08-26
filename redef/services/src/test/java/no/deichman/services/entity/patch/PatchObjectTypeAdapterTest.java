package no.deichman.services.entity.patch;

import com.google.gson.JsonParseException;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.List;

import org.junit.Test;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.reflect.TypeToken;

public class PatchObjectTypeAdapterTest {
    @Test
    public void test_adapter_exists(){
        assertNotNull(new PatchObjectTypeAdapter());
    }

    @Test
    public void test_it_handles_single_object(){
        List<PatchObject> list = new ArrayList<>();

        String input = "{"
                + "  \"op\":\"add\","
                + "  \"s\":\"http://example.com/a\","
                + "  \"p\":\"http://example.com/title\","
                + "  \"o\":{\"value\":\"Housea\"}"
                + "}";

        Type patchType = new TypeToken<List<PatchObject>>() {}.getType();
        Gson gson = new GsonBuilder().registerTypeAdapter(patchType, new PatchObjectTypeAdapter()).create();
        list.addAll(gson.fromJson(input, patchType));
        assertEquals(1, list.size());
    }

    @Test
    public void test_it_handles_multiple_objects(){
        List<PatchObject> list = new ArrayList<>();
        String input = "["
                     + "  {"
                     + "    \"op\":\"add\","
                     + "    \"s\":\"http://example.com/a\","
                     + "    \"p\":\"http://example.com/title\","
                     + "    \"o\":{\"value\":\"Housea\"}"
                     + "  },"
                     + "  {"
                     + "    \"op\":\"add\","
                     + "    \"s\":\"http://example.com/a\","
                     + "    \"p\":\"http://example.com/title\","
                     + "    \"o\":{\"value\":\"Houseb\"}"
                     + "  }"
                     + "]";
        Type patchType = new TypeToken<List<PatchObject>>() {}.getType();
        Gson gson = new GsonBuilder().registerTypeAdapter(patchType, new PatchObjectTypeAdapter()).create();
        list.addAll(gson.fromJson(input, patchType));
        assertEquals(2, list.size());
    }

    @Test(expected = JsonParseException.class)
    public void it_throws_when_unable_to_parse() {
        String input = "notverygoodisit";
        Type patchType = new TypeToken<List<PatchObject>>() {}.getType();
        Gson gson = new GsonBuilder().registerTypeAdapter(patchType, new PatchObjectTypeAdapter()).create();
        gson.fromJson(input, patchType);
    }
}
