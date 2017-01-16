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
    WORK("work", "Work", Constants.MAIN_TITLE),
    PUBLICATION("publication", "Publication", Constants.MAIN_TITLE),
    PERSON("person", "Person", Constants.NAME),
    PLACE("place", "Place", Constants.PREF_LABEL),
    CORPORATION("corporation", "Corporation", Constants.NAME),
    SERIAL("serial", "Serial", Constants.MAIN_TITLE),
    WORK_SERIES("workSeries", "Workseries", Constants.MAIN_TITLE),
    SUBJECT("subject", "Subject", Constants.PREF_LABEL),
    GENRE("genre", "Genre", Constants.PREF_LABEL),
    MUSICAL_INSTRUMENT("instrument", "Instrument", Constants.PREF_LABEL),
    MUSICAL_COMPOSITION_TYPE("compositionType", "CompositionType", Constants.PREF_LABEL),
    EVENT("event", "Event", Constants.PREF_LABEL);

    // must be handwritten because of stupid Java
    public static final String ALL_TYPES_PATTERN =
            "(work|publication|person|place|corporation|serial|workSeries|subject|genre|instrument|compositionType|event)";

    private final String path;
    private final String rdfType;

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

    private final String searchIndexField;

    EntityType(String path, String rdfType, String searchIndexField) {
        this.path = path;
        this.rdfType = rdfType;
        this.searchIndexField = searchIndexField;
    }

    public static EntityType get(String path) {
        return LOOKUP.get(path);
    }

    public final String getPath() {
        return path;
    }

    public String getRdfType() {
        return rdfType;
    }

    public String getSearchIndexField() {
        return searchIndexField;
    }

    /**
     * Responsibility: provide constants.
     */
    private static class Constants {
        public static final String NAME = "name";
        public static final String MAIN_TITLE = "mainTitle";
        public static final String PREF_LABEL = "prefLabel";
    }
}

