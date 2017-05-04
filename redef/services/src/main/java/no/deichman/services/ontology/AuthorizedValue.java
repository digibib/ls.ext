package no.deichman.services.ontology;

import java.util.ArrayList;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Responsibility: enumerate authorized values.
 */
public enum AuthorizedValue {
    LANGUAGE("language"),
    FORMAT("format"),
    NATIONALITY("nationality"),
    LITERARY_FORM("literaryForm"),
    AUDIENCE("audience"),
    BIOGRAPHY("biography"),
    FORMAT_ADAPTATION("formatAdaptation"),
    CONTENT_ADAPTATION("contentAdaptation"),
    BINDING("binding"),
    WRITING_SYSTEM("writingSystem"),
    ILLUSTRATIVE_MATTER("illustrativeMatter"),
    ROLE("role"),
    MEDIA_TYPE("mediaType"),
    RELATION_TYPE("relationType"),
    DEWEY_EDITION("classificationSource"),
    MUSICAL_KEY("key"),
    WORK_TYPE("workType"),
    FICTION_NONFICTION("fictionNonfiction"),
    CATALOGUING_SOURCE("cataloguingSource");

    public static final String ALL_TYPES_PATTERN = "("
            + "language|"
            + "format|"
            + "nationality|"
            + "literaryForm|"
            + "audience|"
            + "biography|"
            + "formatAdaptation|"
            + "contentAdaptation|"
            + "binding|"
            + "writingSystem|"
            + "illustrativeMatter|"
            + "role|"
            + "mediaType|"
            + "relationType|"
            + "classificationSource|"
            + "key|"
            + "workType|"
            + "fictionNonfiction|"
            + "cataloguingSource)";

    private final String path;

    private static final Map<String, AuthorizedValue> LOOKUP = new HashMap<>();

    static {
        List<String> allPaths = new ArrayList<>();
        for(AuthorizedValue s : EnumSet.allOf(AuthorizedValue.class)) {
            LOOKUP.put(s.path, s);
            allPaths.add(s.path);

        }
        String wantedPattern = "(" + String.join("|", allPaths) + ")";
        assert wantedPattern.equals(ALL_TYPES_PATTERN) : "Please update ALL_TYPES_PATTERN to '" + wantedPattern + "'";
    }

    AuthorizedValue(String path) {
        this.path = path;
    }

    public static AuthorizedValue get(String path) {
        return LOOKUP.get(path);
    }

    public final String getPath() {
        return path;
    }

}
