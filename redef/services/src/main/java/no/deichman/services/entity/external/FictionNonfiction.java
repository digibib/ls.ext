package no.deichman.services.entity.external;

import com.google.common.collect.ImmutableMap;

import java.util.Map;

/**
 * Responsibility: map literary form codes to rdf.
 */
public final class FictionNonfiction {
    private FictionNonfiction() {
    }

    private static final Map<String, String> FORMAT_MAP = ImmutableMap.<String, String>builder()
            .put("0", "nonfiction")
            .put("1", "fiction")
            .build();

    public static String translate(String formatCode) {
        return FORMAT_MAP.get(formatCode);
    }
}
