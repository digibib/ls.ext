package no.deichman.services.entity.external;

import com.google.common.collect.ImmutableMap;

import java.util.Map;

/**
 * Responsibility: map audience codes to rdf.
 */
public final class Audience {
    private Audience() {
    }

    private static final Map<String, String> FORMAT_MAP = ImmutableMap.<String, String>builder()
            .put("aa", "ages0To2")
            .put("a", "ages3To5")
            .put("b", "ages6To8")
            .put("bu", "ages9To10")
            .put("u", "ages11To12")
            .put("mu", "ages13To15")
            .build();

    private static final Map<String, String> FORMAT_MAP_008_22 = ImmutableMap.<String, String>builder()
            .put("a", "adult")
            .put("j", "juvenile")
            .build();

    public static String translate(String formatCode) {
        return FORMAT_MAP.get(formatCode);
    }

    public static String translate008pos22(String formatCode) {
        return FORMAT_MAP_008_22.get(formatCode);
    }
}
