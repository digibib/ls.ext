package no.deichman.services.entity;

import org.apache.commons.lang3.StringUtils;

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
    WORK_SERIES("workSeries", "WorkSeries", Constants.MAIN_TITLE),
    SUBJECT("subject", "Subject", Constants.PREF_LABEL),
    GENRE("genre", "Genre", Constants.PREF_LABEL),
    MUSICAL_INSTRUMENT("instrument", "Instrument", Constants.PREF_LABEL),
    MUSICAL_COMPOSITION_TYPE("compositionType", "CompositionType", Constants.PREF_LABEL),
    EVENT("event", "Event", Constants.PREF_LABEL);

    // must be handwritten because of stupid Java
    public static final String ALL_TYPES_PATTERN =
            "(work|publication|person|place|corporation|serial|workSeries|subject|genre|instrument|compositionType|event)";
    private static final String DISPLAY_LINE_1 = "displayLine1";
    private static final String DISPLAY_LINE_2 = "displayLine2";

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

    public void addSortingLabels(Map<String, Object> map) {
        String displayLine1 = "";
        String displayLine2 = "";
        switch (this) {
            case WORK:
                if (map.containsKey("mainEntryName")) {
                    displayLine1 = map.get("mainEntryName").toString() + ". ";
                }
                if (map.containsKey("mainTitle")) {
                    displayLine1 += map.get("mainTitle").toString();
                }
                if (map.containsKey("subtitle")) {
                    displayLine1 += " : " + map.get("subtitle").toString();
                }
                if (map.containsKey("partNumber")) {
                    displayLine1 += ". " + map.get("partNumber").toString();
                }
                if (map.containsKey("partTitle")) {
                    displayLine1 += ". " + map.get("partTitle").toString();
                }
                if (map.containsKey("publicationYear")) {
                    displayLine2 += map.get("publicationYear").toString();
                }
                if (map.containsKey("workTypeLabel")) {
                    if (displayLine2.length() > 0) {
                        displayLine2 += ". ";
                    }
                    displayLine2 += map.get("workTypeLabel").toString();
                }
                if (map.containsKey("litform")) {
                    if (displayLine2.length() > 0) {
                        displayLine2 += ". ";
                    }
                    if (map.get("litform").getClass() == String.class) {
                        displayLine2 += map.get("litform").toString();
                    } else if (map.get("litform").getClass() == ArrayList.class) {
                        displayLine2 += StringUtils.join((ArrayList) map.get("litform"), ", ");
                    }
                }
                break;
            case PUBLICATION:
                if (map.containsKey("mainEntryName")) {
                    displayLine1 = map.get("mainEntryName").toString() + ". ";
                }
                if (map.containsKey("mainTitle")) {
                    displayLine1 += map.get("mainTitle").toString();
                }
                if (map.containsKey("subtitle")) {
                    displayLine1 += " : " + map.get("subtitle").toString();
                }
                if (map.containsKey("partNumber")) {
                    displayLine1 += ". " + map.get("partNumber").toString();
                }
                if (map.containsKey("partTitle")) {
                    displayLine1 += ". " + map.get("partTitle").toString();
                }
                if (map.containsKey("mt") || map.containsKey("format")) {
                    displayLine1 += " (";
                    if (map.containsKey("mt")) {
                        displayLine1 += map.get("mt").toString();
                    }
                    if (map.containsKey("format")) {
                        displayLine1 += ". " + map.get("format").toString();
                    }
                    displayLine1 += ")";
                }
                if (map.containsKey("publishedBy")) {
                    displayLine2 += map.get("publishedBy").toString();
                }
                if (map.containsKey("publicationYear")) {
                    if (displayLine2.length() > 0) {
                        displayLine2 += ", ";
                    }
                    displayLine2 += map.get("publicationYear");
                }
                if (map.containsKey("isbn")) {
                    if (displayLine2.length() > 0) {
                        displayLine2 += ". ";
                    }
                    displayLine2 += "ISBN " + map.get("isbn").toString();
                }
                if (map.containsKey("ean")) {
                    if (displayLine2.length() > 0) {
                        displayLine2 += ". ";
                    }
                    displayLine2 += "EAN " + map.get("ean").toString();
                }
                if (map.containsKey("recordId")) {
                    if (displayLine2.length() > 0) {
                        displayLine2 += ". ";
                    }
                    displayLine2 += "Tnr: " + map.get("recordId").toString();
                }
                break;
            case PERSON:
                displayLine1 = map.getOrDefault("name", "").toString();
                if (map.containsKey("ordinal")) {
                    displayLine1 += " " + map.get("ordinal").toString();
                }
                if (map.containsKey("specification")) {
                    displayLine1 += " (" + map.get("specification").toString() + ")";
                }
                if (map.containsKey("birthYear") || map.containsKey("deathYear")) {
                    displayLine1 += ", ";
                    if (map.containsKey("birthYear")) {
                        displayLine1 += map.get("birthYear").toString();
                    }
                    displayLine1 += "-";
                    if (map.containsKey("deathYear")) {
                        displayLine1 += map.get("deathYear").toString();
                    }
                }
                if (map.containsKey("nationality")) {
                    if (map.get("nationality").getClass() == String.class) {
                        displayLine2 = map.get("nationality").toString();
                    } else if (map.get("nationality").getClass() == ArrayList.class) {
                        displayLine2 = StringUtils.join((ArrayList) map.get("nationality"), ", ");
                    }
                }
                break;
            case CORPORATION:
                displayLine1 = map.getOrDefault("name", "").toString();
                if (map.containsKey("subdivision")) {
                    displayLine1 += ". " + map.get("subdivision").toString();
                }
                if (map.containsKey("specification")) {
                    displayLine1 += " (" + map.get("specification").toString() + ")";
                }
                if (map.containsKey("placePrefLabel")) {
                    displayLine1 += ". " + map.get("placePrefLabel").toString();
                }
                break;
            case EVENT:
                displayLine1 = map.getOrDefault("prefLabel", "").toString();
                if (map.containsKey("ordinal")) {
                    displayLine1 += " " + map.get("ordinal").toString();
                }
                if (map.containsKey("date")) {
                    displayLine1 += ". " + map.get("date").toString();
                }
                if (map.containsKey("placePrefLabel")) {
                    displayLine1 += ", " + map.get("placePrefLabel").toString();
                }
                if (map.containsKey("placeSpecification")) {
                    displayLine1 += " (" + map.get("placeSpecification").toString() + ")";
                }
                if (map.containsKey("specification")) {
                    displayLine1 += " (" + map.get("specification").toString() + ")";
                }
                break;
            case SERIAL:
                displayLine1 = map.getOrDefault("serialMainTitle", "").toString();
                if (map.containsKey("subtitle")) {
                    displayLine1 += " : " + map.get("subtitle").toString();
                }
                if (map.containsKey("partNumber")) {
                    displayLine1 += ". " + map.get("partNumber").toString();
                }
                if (map.containsKey("partTitle")) {
                    displayLine1 += ". " + map.get("partTitle").toString();
                }
                if (map.containsKey("publishedByName")) {
                    displayLine1 += " (" + map.get("publishedByName").toString() + ")";
                }
                break;
            case WORK_SERIES:
                displayLine1 = map.getOrDefault("workSeriesMainTitle", "").toString();
                if (map.containsKey("subtitle")) {
                    displayLine1 += " : " + map.get("subtitle").toString();
                }
                if (map.containsKey("partNumber")) {
                    displayLine1 += ". " + map.get("partNumber").toString();
                }
                if (map.containsKey("partTitle")) {
                    displayLine1 += ". " + map.get("partTitle").toString();
                }
                break;
            case SUBJECT:
            case GENRE:
            case MUSICAL_INSTRUMENT:
            case MUSICAL_COMPOSITION_TYPE:
            case PLACE:
                displayLine1 = map.getOrDefault("prefLabel", "").toString();
                if (map.containsKey("specification")) {
                    displayLine1 += " (" + map.get("specification").toString() + ")";
                }
                break;
            default:
                break;
        }
        if (displayLine1.length() > 0) {
            map.put(DISPLAY_LINE_1, displayLine1);
        }
        if (displayLine2.length() > 0) {
            map.put(DISPLAY_LINE_2, displayLine2);
        }
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

