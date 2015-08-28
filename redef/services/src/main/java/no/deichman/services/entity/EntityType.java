package no.deichman.services.entity;

import java.util.EnumSet;
import java.util.HashMap;
import java.util.Map;

/**
 * Responsibility: Enumerate different resource types.
 */
public enum EntityType {
    WORK("work"),
    PUBLICATION("publication");

    private final String path;

    private static final Map<String, EntityType> LOOKUP = new HashMap<>();
    static {
        for(EntityType s : EnumSet.allOf(EntityType.class)) {
            LOOKUP.put(s.path, s);
        }
    }

    EntityType(String path) {
        this.path = path;
    }

    public static EntityType get(String path) {
        return LOOKUP.get(path);
    }
}

