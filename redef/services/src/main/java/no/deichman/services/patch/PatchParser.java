package no.deichman.services.patch;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.reflect.TypeToken;

import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.List;

/**
 * Responsibility: TODO.
 */
public final class PatchParser {

    private String patchInput;
    private List<PatchObject> rawParseObject = new ArrayList<PatchObject>();

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
        rawPatches = gson.fromJson(patchInput,patchObjectListType);
        rawParseObject.addAll(rawPatches);
        return rawPatches;
    }

    public void setPatchData(String input){
        patchInput = input;
    }

    public String getPatchInput() {
        return patchInput;
    }

    public List<PatchObject> getRawPatchObject() {
        return rawParseObject;
    }
}
