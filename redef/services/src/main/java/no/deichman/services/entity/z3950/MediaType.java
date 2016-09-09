package no.deichman.services.entity.z3950;

import com.google.common.collect.ImmutableMap;

import java.util.Map;

/**
 * Responsibility: map format codes to rdf.
 */
public final class MediaType {
    private MediaType() {
    }

    private static final Map<String, String> FORMAT_MAP = ImmutableMap.<String, String>builder()
            .put("a", "Map")
            .put("ab", "Map")
            .put("c", "SheetMusic")
            .put("dg", "MusicRecording")
            .put("dh", "LanguageCourse")
            .put("di", "Audiobook")
            .put("dj", "Audiobook")
            .put("ga", "E-book")
            .put("l", "Book")
            .put("la", "E-book")
            .put("na", "E-book")
            .put("nb", "E-book")
            .build();

    public static String translate(String formatCode) {
        return FORMAT_MAP.get(formatCode);
    }
}
