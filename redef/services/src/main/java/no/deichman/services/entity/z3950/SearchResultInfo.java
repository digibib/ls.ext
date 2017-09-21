package no.deichman.services.entity.z3950;

/**
 * Responsibility: contain marx xml and metadata i.e. total number of records and position of next record in result set.
 */
public final class SearchResultInfo {
    private final String marxXmlContent;
    private final Long numberOfRecords;
    private final Long nextRecordPosition;

    public SearchResultInfo(String marxXmlContent, long numberOfRecords, long nextRecordPosition) {
        this.marxXmlContent = marxXmlContent;
        this.numberOfRecords = numberOfRecords;
        this.nextRecordPosition = nextRecordPosition;
    }

    public SearchResultInfo(String marxXmlContent) {
        this.marxXmlContent = marxXmlContent;
        numberOfRecords = null;
        nextRecordPosition = null;
    }

    String getMarxXmlContent() {
        return marxXmlContent;
    }

    Long getNumberOfRecords() {
        return numberOfRecords;
    }

    Long getNextRecordPosition() {
        return nextRecordPosition;
    }
}
