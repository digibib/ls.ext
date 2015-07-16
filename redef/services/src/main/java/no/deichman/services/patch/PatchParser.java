package no.deichman.services.patch;

import no.deichman.services.patch.PatchObject;

import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.List;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.reflect.TypeToken;

public class PatchParser {

    private String patch_input;
    private List<PatchObject> raw_parse_object = new ArrayList<PatchObject>();

    PatchParser(String input){
        setPatchData(input);
    }

    public PatchParser() {
    }

    public List<PatchObject> parsePatch(){
        List<PatchObject> rawPatches = new ArrayList<PatchObject>();
        Type patchObjectListType = new TypeToken<List<PatchObject>>() {}.getType();
        Gson gson = new GsonBuilder()
                .registerTypeAdapter(patchObjectListType, new PatchObjectTypeAdapter())
                .create();
        rawPatches = gson.fromJson(patch_input,patchObjectListType);
        raw_parse_object.addAll(rawPatches);
        return rawPatches;
    }

    public void setPatchData(String input){
        patch_input = input;
    }

    public String getPatchInput() {
        return patch_input;
    }

    public List<PatchObject> getRawPatchObject() {
        return raw_parse_object;
    }
}
