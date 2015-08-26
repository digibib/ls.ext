package no.deichman.services.entity.patch;

import com.google.gson.JsonDeserializationContext;
import com.google.gson.JsonDeserializer;
import com.google.gson.JsonElement;
import com.google.gson.JsonParseException;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.List;

/**
 * Responsibility: TODO.
 */
final class PatchObjectTypeAdapter implements JsonDeserializer<List<PatchObject>> {
    public List<PatchObject> deserialize(JsonElement json, Type typeOfT, JsonDeserializationContext ctx) throws JsonParseException {
        List<PatchObject> vals = new ArrayList<PatchObject>();
        if (json.isJsonArray()) {
            for (JsonElement e : json.getAsJsonArray()) {
                vals.add(ctx.deserialize(e, PatchObject.class));
            }
        } else if (json.isJsonObject()) {
            vals.add(ctx.deserialize(json, PatchObject.class));
        } else {
            throw new JsonParseException("Unexpected JSON type: " + json.getClass());
        }
        return vals;
    }

}
