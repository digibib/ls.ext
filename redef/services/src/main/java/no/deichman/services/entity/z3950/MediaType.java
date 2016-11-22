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
            .put("da", "MusicRecording")
            .put("db", "MusicRecording")
            .put("dc", "MusicRecording")
            .put("dg", "MusicRecording")
            .put("dz", "MusicRecording")
            .put("dh", "LanguageCourse")
            .put("di", "Audiobook")
            .put("gt", "Audiobook")
            .put("ed", "Film")
            .put("ee", "Film")
            .put("ef", "Film")
            .put("eg", "Film")
            .put("gc", "Game")
            .put("gd", "Other")
            .put("ma", "Game")
            .put("mb", "Game")
            .put("mc", "Game")
            .put("me", "Game")
            .put("mj", "Game")
            .put("mk", "Game")
            .put("mn", "Game")
            .put("mo", "Game")
            .put("fd", "Other")
            .build();

    public static final Map<String, String> PAGED_MEDIA_TYPE_MAP = ImmutableMap.<String, String>builder()
            .put("a", "Map")
            .put("ab", "Map")
            .put("c", "SheetMusic")
            .put("dd", "E-book")
            .put("de", "E-book")
            .put("ga", "E-book")
            .put("la", "E-book")
            .put("na", "E-book")
            .put("nb", "E-book")
            .put("l", "Book")
            .build();

    public static String translateUnitedMediaType(String formatCode) {
        return UNITED_MEDIA_TYPE_MAP.get(formatCode);
    }

    public static String translatePagedMediaType(String formatCode) {
        return PAGED_MEDIA_TYPE_MAP.get(formatCode);
    }
}
