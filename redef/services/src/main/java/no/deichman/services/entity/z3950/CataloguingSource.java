package no.deichman.services.entity.z3950;

import com.google.common.collect.ImmutableMap;

import java.util.Map;

/**
 * Responsibility: handle mapping of cataloguing source.
 */
public final class CataloguingSource {
    private CataloguingSource() {
    }

    private static final Map<String, String> CATALOGUING_SOURCE_MAP = ImmutableMap.<String, String>builder()
            .put("bibbi", "BS")
            .build();

    public static String translate(String source) {
        return CATALOGUING_SOURCE_MAP.get(source);
    }

}
