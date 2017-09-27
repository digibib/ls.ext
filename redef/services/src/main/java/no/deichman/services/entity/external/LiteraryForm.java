package no.deichman.services.entity.external;

import com.google.common.collect.ImmutableMap;

import java.util.Map;

/**
 * Responsibility: map literary form codes to rdf.
 */
public final class LiteraryForm {
    private LiteraryForm() {
    }

    private static final Map<String, String> FORMAT_MAP = ImmutableMap.<String, String>builder()
            .put("r", "novel")
            .put("n", "shortStory")
            .put("d", "poetry")
            .put("s", "drama")
            .put("t", "comicBook")
            .put("a", "anthology")
            .put("l", "textBook")
            .put("p", "pointingBook")
            .put("b", "pictureBook")
            .build();

    public static String translate(String formatCode) {
        return FORMAT_MAP.get(formatCode);
    }
}
