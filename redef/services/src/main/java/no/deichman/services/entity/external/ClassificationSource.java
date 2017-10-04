package no.deichman.services.entity.external;

import com.google.common.collect.ImmutableMap;

import java.util.Map;

/**
 * Responsibiliy: provide translation of classification source codes.
 */
public final class ClassificationSource {
    private ClassificationSource() {
    }

    private static final Map<String, String> FORMAT_MAP = ImmutableMap.<String, String>builder()
            .put("4", "ddk4")
            .put("5", "ddk5")
            .put("23/nor", "ddk23")
            .put("DDC20", "ddc20")
            .put("DDC21", "ddc21")
            .put("DDC22", "ddc22")
            .put("DDC23", "ddc23")
            .build();

    public static String translate(String formatCode) {
        return FORMAT_MAP.get(formatCode);
    }

}
