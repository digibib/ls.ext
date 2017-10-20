package no.deichman.services.entity.external;

import com.google.common.collect.ImmutableMap;

import java.util.Map;

import static com.google.common.collect.ImmutableMap.of;
import static java.util.Collections.EMPTY_MAP;
import static no.deichman.services.uridefaults.BaseURI.cataloguingSource;

/**
 * Responsibility: Provide details of Z39.50 targets.
 */
public enum Target {
    BIBBI("bibbi", "normarc", cataloguingSource("BS"), SRU.FIELD_MAPPING),
    LOC("loc", "marc21", cataloguingSource("LoC")),
    DFB("dfb", "bibliofilmarc", cataloguingSource("DFB"), SRU.FIELD_MAPPING);

    private final Map<String, String> parameterMap;
    private String databaseName;
    private String dataFormat;
    private String cataloguingSourceUri;

    Target(String databaseName, String dataFormat, String cataloguingSourceUri) {
        this(databaseName, dataFormat, cataloguingSourceUri, EMPTY_MAP);
    }

    Target(String databaseName, String dataFormat, String cataloguingSourceUri,  Map<String, String> parameterMap) {
        this.databaseName = databaseName;
        this.dataFormat = dataFormat;
        this.cataloguingSourceUri = cataloguingSourceUri;
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

    public String getCataloguingSourceUri() {
        return cataloguingSourceUri;
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
