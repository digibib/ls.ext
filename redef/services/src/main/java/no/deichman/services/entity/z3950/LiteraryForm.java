package no.deichman.services.entity.z3950;

import com.google.common.collect.ImmutableMap;

import java.util.Map;

/**
 * Responsibility: map literary form codes to rdf.
 */
public final class LiteraryForm {
    private LiteraryForm() {
    }

    private static final Map<String, String> FORMAT_MAP = ImmutableMap.<String, String>builder()
            .put("0", "nonfiction")
            .put("1", "fiction")
            .put("r", "novel")
            .put("n", "shortStory")
            .put("d", "poem")
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
