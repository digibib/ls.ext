package no.deichman.services.circulation;

import com.google.gson.annotations.Expose;
import com.google.gson.annotations.SerializedName;

/**
 * Responsibility: Container object for raw loan data from Koha API.
 */
public final class RawLoan {
    @Expose
    @SerializedName("issue_id")
    private String id;
    @Expose
    @SerializedName("borrowernumber")
    private String borrowerId;
    @Expose
    @SerializedName("itemnumber")
    private String itemNumber;
    @Expose
    @SerializedName("return")
    private String returnNOOP;
    @Expose
    @SerializedName("date_due")
    private String dueDate;
    @Expose
    @SerializedName("renewals")
    private int renewals;
    @Expose
    @SerializedName("timestamp")
    private String timestamp;
    @Expose
    @SerializedName("returndate")
    private String returnDate;
    @Expose
    @SerializedName("auto_renew")
    private String autorenew;
    @Expose
    @SerializedName("lastrenewdate")
    private String lastRenewDate;
    @Expose
    @SerializedName("issuedate")
    private String issueDate;
    @Expose
    @SerializedName("branchcode")
    private String branchCode;

    public RawLoan() {
    }

    public String getItemNumber() {
        return itemNumber;
    }

    public void setItemNumber(String itemNumber) {
        this.itemNumber = itemNumber;
    }

    public String getDueDate() {
        return dueDate;
    }

    public void setDueDate(String dueDate) {
        this.dueDate = dueDate;
    }

    public int getRenewals() {
        return renewals;
    }

    public void setRenewals(int renewals) {
        this.renewals = renewals;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public String getReturnDate() {
        return returnDate;
    }

    public void setReturnDate(String returnDate) {
        this.returnDate = returnDate;
    }

    public String getAutorenew() {
        return autorenew;
    }

    public void setAutorenew(String autorenew) {
        this.autorenew = autorenew;
    }

    public String getLastRenewDate() {
        return lastRenewDate;
    }

    public void setLastRenewDate(String lastRenewDate) {
        this.lastRenewDate = lastRenewDate;
    }

    public String getIssueDate() {
        return issueDate;
    }

    public void setIssueDate(String issueDate) {
        this.issueDate = issueDate;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getBranchCode() {
        return branchCode;
    }

    public void setBranchCode(String branchCode) {
        this.branchCode = branchCode;
    }

    public String getBorrowerId() {
        return borrowerId;
    }

    public void setBorrowerId(String borrowerId) {
        this.borrowerId = borrowerId;
    }
}
