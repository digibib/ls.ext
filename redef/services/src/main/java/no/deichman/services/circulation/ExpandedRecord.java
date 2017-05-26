package no.deichman.services.circulation;

import com.google.gson.annotations.Expose;
import com.google.gson.annotations.SerializedName;

import java.util.List;

/**
 * Responsibility: holds data for biblio and its items.
 */
public final class ExpandedRecord {
    @Expose
    @SerializedName(value = "loanRecord", alternate = "biblio")
    private Record loanRecord;
    @Expose
    @SerializedName("items")
    private List<Item> items;

    public Record getRecord() {
        return loanRecord;
    }

    public void setLoanRecord(Record loanRecord) {
        this.loanRecord = loanRecord;
    }

    public List<Item> getItems() {
        return items;
    }

    public void setItems(List<Item> items) {
        this.items = items;
    }

    public Record getLoanRecord() {
        return loanRecord;
    }
}
