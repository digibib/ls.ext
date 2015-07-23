package no.deichman.services.patch;

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
        List<PatchObject> list = new ArrayList<PatchObject>();
        String input = "{\"op\":\"add\",\"s\":\"http://example.com/a\",\"p\":\"http://example.com/title\",\"o\":{\"value\":\"Housea\"}}";
        Type polt = new TypeToken<List<PatchObject>>() {}.getType();
        Gson gson = new GsonBuilder()
                .registerTypeAdapter(polt, new PatchObjectTypeAdapter())
                .create();
        list.addAll(gson.fromJson(input,polt));
        assertEquals(1,list.size());
    }

    @Test
    public void test_it_handles_multiple_objects(){
        List<PatchObject> list = new ArrayList<PatchObject>();
        String input = "[{\"op\":\"add\",\"s\":\"http://example.com/a\",\"p\":\"http://example.com/title\",\"o\":{\"value\":\"Housea\"}},"
                + "{\"op\":\"add\",\"s\":\"http://example.com/a\",\"p\":\"http://example.com/title\",\"o\":{\"value\":\"Houseb\"}}]";
        Type polt = new TypeToken<List<PatchObject>>() {}.getType();
        Gson gson = new GsonBuilder()
                .registerTypeAdapter(polt, new PatchObjectTypeAdapter())
                .create();
        list.addAll(gson.fromJson(input,polt));
        assertEquals(2,list.size());
    }
}
