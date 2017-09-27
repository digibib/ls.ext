package no.deichman.services.entity.external;

import com.google.gson.annotations.SerializedName;

import java.util.List;

/**
 * Responsibility: provide formatted results.
 */
final class Result {
    @SerializedName("source")
    private String source;
    @SerializedName("hits")
    private List<Object> hits;

    @SerializedName("totalHits")
    private Long numberOfRecords;

    @SerializedName("nextRecordPosition")
    private Long nextRecordPosition;

    Result(SearchResultInfo recordSet) {
        numberOfRecords = recordSet.getNumberOfRecords();
        nextRecordPosition = recordSet.getNextRecordPosition();
    }

    Result() {

    }

    String getSource() {
        return source;
    }

    void setSource(String source) {
        this.source = source;
    }

    List<Object> getHits() {
        return hits;
    }

    void setHits(List<Object> hits) {
        this.hits = hits;
    }
}
