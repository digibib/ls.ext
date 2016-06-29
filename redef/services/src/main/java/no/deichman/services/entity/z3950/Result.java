package no.deichman.services.entity.z3950;

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
