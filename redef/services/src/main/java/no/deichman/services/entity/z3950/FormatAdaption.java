package no.deichman.services.entity.z3950;

import com.google.common.collect.ImmutableMap;

import java.util.Map;

/**
 * Responsibility: map format adaption from codes to rdf.
 */
public final class FormatAdaption {
    private FormatAdaption() {
    }

    private static final Map<String, String> FORMAT_MAP = ImmutableMap.<String, String>builder()
            .put("tc", "largePrint")
            .put("te", "braille")
            .put("tf", "signLanguage")
            .put("tg", "tactile")
            .put("tj", "capitalLetters")
            .build();

    public static String translate(String formatCode) {
        return FORMAT_MAP.get(formatCode);
    }
}
