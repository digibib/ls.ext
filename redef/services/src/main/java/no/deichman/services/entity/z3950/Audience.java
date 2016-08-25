package no.deichman.services.entity.z3950;

import com.google.common.collect.ImmutableMap;

import java.util.Map;

/**
 * Responsibility: map format codes to rdf
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

    public final static String translate(String formatCode) {
        return FORMAT_MAP.get(formatCode);
    }
}
