package no.deichman.services.circulation;

import com.google.gson.annotations.Expose;
import com.google.gson.annotations.SerializedName;

/**
 * Responsibility: Container object for loans.
 */
public final class Loan extends CirculationObjectBase {

    @Expose
    @SerializedName(value = "itemNumber", alternate = "itemnumber")
    private String itemNumber;
    @SerializedName("return")
    private String returnNOOP;
    @Expose
    @SerializedName(value = "dueDate", alternate = "date_due")
    private String dueDate;
    @SerializedName("renewals")
    private int renewals;
    @SerializedName("timestamp")
    private String timestamp;
    @SerializedName(value = "returnDate", alternate = "returndate")
    private String returnDate;
    @SerializedName("auto_renew")
    private String autorenew;
    @SerializedName("lastrenewdate")
    private String lastRenewDate;
    @SerializedName("issuedate")
    private String issueDate;

    public String getItemNumber() {
        return itemNumber;
    }

    public void setItemNumber(String itemNumber) {
        this.itemNumber = itemNumber;
    }

    public void setDueDate(String dueDate) {
        this.dueDate = dueDate;
    }
}
