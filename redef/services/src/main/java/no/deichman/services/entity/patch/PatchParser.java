package no.deichman.services.entity.patch;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonParseException;
import com.google.gson.reflect.TypeToken;

import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

/**
 * Responsibility: TODO.
 */
public final class PatchParser {

    private String patchInput;
    private List<PatchObject> rawParseObject = new ArrayList<>();
    private static final Type PATCH_OBJECT_LIST_TYPE = new TypeToken<List<PatchObject>>() {}.getType();

    PatchParser(String input){
        setPatchData(input);
    }

    public PatchParser() {
    }

    public static List<Patch> parse(String ldPatchJson) throws PatchParserException {
        PatchParser patchParser = new PatchParser();
        patchParser.setPatchData(ldPatchJson);
        List<PatchObject> patch = patchParser.parsePatch();
        List<Patch> patches = new ArrayList<>();
        Iterator<PatchObject> iter = patch.iterator();
        while (iter.hasNext()) {
            patches.add(iter.next().toPatch());
        }
        return patches;
    }

    List<PatchObject> parsePatch() throws PatchParserException {
        Gson gson = new GsonBuilder()
                .registerTypeAdapter(PATCH_OBJECT_LIST_TYPE, new PatchObjectTypeAdapter())
                .create();
        List<PatchObject> rawPatches;
        try {
            rawPatches = gson.fromJson(patchInput, PATCH_OBJECT_LIST_TYPE);
        } catch (JsonParseException jpe) {
            throw new PatchParserException("Error parsing patch" + patchInput, jpe);
        }
        rawParseObject.addAll(rawPatches);
        return rawPatches;
    }

    void setPatchData(String input){
        patchInput = input;
    }

    String getPatchInput() {
        return patchInput;
    }

    List<PatchObject> getRawPatchObject() {
        return rawParseObject;
    }
}
