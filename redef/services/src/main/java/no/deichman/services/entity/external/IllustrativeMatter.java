package no.deichman.services.entity.external;

import com.google.common.collect.ImmutableMap;

import java.util.Map;

/**
 * Responsibility: map illustrative matter form codes to rdf.
 */
public final class IllustrativeMatter {
    private IllustrativeMatter() {
    }

    private static final Map<String, String> FORMAT_MAP = ImmutableMap.<String, String>builder()
            .put("ill", "illustrert")
            .put("kol ill", "kolorerte_illustrasjoner")
            .put("kart", "kart")
            .put("port", "portrett")
            .put("fig", "figur")
            .put("tab", "tabell")
            .put("pl", "plansje")
            .build();

    public static String translate(String formatCode) {
        return FORMAT_MAP.get(formatCode);
    }
}
