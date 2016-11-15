package no.deichman.services.entity.z3950;

import com.google.common.collect.ImmutableMap;

import java.util.Map;

/**
 * Responsibility: map format codes to rdf.
 */
public final class MediaType {
    private MediaType() {
    }

    private static final Map<String, String> UNITED_MEDIA_TYPE_MAP = ImmutableMap.<String, String>builder()
            .put("dg", "MusicRecording")
            .put("dh", "LanguageCourse")
            .put("di", "Audiobook")
            .put("dj", "Audiobook")
            .put("ga", "E-book")
            .put("la", "E-book")
            .put("na", "E-book")
            .put("nb", "E-book")
            .build();

    public static final Map<String, String> PAGED_MEDIA_TYPE_MAP = ImmutableMap.<String, String>builder()
            .put("a", "Map")
            .put("ab", "Map")
            .put("c", "SheetMusic")
            .put("l", "Book")
            .build();

    public static String translateUnitedMediaType(String formatCode) {
        return UNITED_MEDIA_TYPE_MAP.get(formatCode);
    }

    public static String translatePagedMediaType(String formatCode) {
        return PAGED_MEDIA_TYPE_MAP.get(formatCode);
    }
}
