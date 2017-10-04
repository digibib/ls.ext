package no.deichman.services.entity.external;

import com.google.common.collect.ImmutableMap;

import java.util.Map;

/**
 * Responsibility: map binding from codes to rdf.
 */
public final class LocationFormat {
    private LocationFormat() {
    }

    private static final Map<String, String> FORMAT_MAP = ImmutableMap.<String, String>builder()
            .put("CD", "CD (kompaktplate)")
            .put("q", "Kvartformat") // quarto
            .put("tv", "Tverrformat")
            .put("f", "Folioformat") // folio
            .put("T", "Tegneserie")
            .build();

    public static String translate(String formatCode) {
        return FORMAT_MAP.get(formatCode);
    }
}
