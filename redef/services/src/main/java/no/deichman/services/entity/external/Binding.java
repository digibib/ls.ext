package no.deichman.services.entity.external;

import com.google.common.collect.ImmutableMap;

import java.util.Map;

/**
 * Responsibility: map binding from codes to rdf.
 */
public final class Binding {
    private Binding() {
    }

    private static final Map<String, String> FORMAT_MAP = ImmutableMap.<String, String>builder()
            .put("ib", "innbundet")
            .put("h", "heftet")
            .build();

    public static String translate(String formatCode) {
        return FORMAT_MAP.get(formatCode);
    }
}
