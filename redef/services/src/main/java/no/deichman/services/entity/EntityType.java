package no.deichman.services.entity;

import java.util.ArrayList;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Responsibility: Enumerate different resource types.
 */
public enum EntityType {
    WORK("work"),
    PUBLICATION("publication"),
    PERSON("person"),
    PLACE("place"),
    CORPORATION("corporation"),
    SERIAL("serial"),
    SUBJECT("subject"),
    GENRE("genre");

    // must be handwritten because of stupid Java
    public static final String ALL_TYPES_PATTERN =
            "(work|publication|person|place|corporation|serial|subject|genre)";

    private final String path;

    private static final Map<String, EntityType> LOOKUP = new HashMap<>();

    static {
        List<String> allPaths = new ArrayList<>();
        for(EntityType s : EnumSet.allOf(EntityType.class)) {
            LOOKUP.put(s.path, s);
            allPaths.add(s.path);

        }
        String wantedPattern = "(" + String.join("|", allPaths) + ")";
        assert wantedPattern.equals(ALL_TYPES_PATTERN) : "Please update ALL_TYPES_PATTERN to '" + wantedPattern + "'";
    }

    EntityType(String path) {
        this.path = path;
    }

    public static EntityType get(String path) {
        return LOOKUP.get(path);
    }

    public final String getPath() {
        return path;
    }
}

