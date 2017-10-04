package no.deichman.services.entity.external;

import com.google.common.collect.ImmutableMap;

import java.util.Map;

import static com.google.common.collect.ImmutableMap.of;
import static java.util.Collections.EMPTY_MAP;

/**
 * Responsibility: Provide details of Z39.50 targets.
 */
public enum Target {
    BIBBI("bibbi", "normarc", SRU.FIELD_MAPPING),
    LOC("loc", "marc21"),
    DFB("dfb", "bibliofilmarc", SRU.FIELD_MAPPING);

    private final Map<String, String> parameterMap;
    private String databaseName;
    private String dataFormat;

    Target(String databaseName, String dataFormat) {
        this(databaseName, dataFormat, EMPTY_MAP);
    }

    Target(String databaseName, String dataFormat, Map<String, String> parameterMap) {
        this.databaseName = databaseName;
        this.dataFormat = dataFormat;
        this.parameterMap = parameterMap;
    }

    public String getDatabaseName() {
        return databaseName;
    }

    public String getDataFormat() {
        return dataFormat;
    }

    public Map<String, String> getParameterMap() {
        return parameterMap;
    }

    /**
     * responsibility: Map local search fields to NorZig SRU profile ones.
     */
    private static class SRU {
        static final ImmutableMap<String, String> FIELD_MAPPING = of(
                "local_id", "rec.identifier",
                "isbn", "dc.identifier",
                "ean", "dc.identifier",
                "title", "dc.title",
                "author", "dc.creator");
    }
}
