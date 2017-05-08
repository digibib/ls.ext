package no.deichman.services.circulation;

import com.google.gson.annotations.Expose;
import com.google.gson.annotations.SerializedName;

/**
 * Responsibility: receives raw holds format.
 */
public final class RawHold {
    @Expose
    @SerializedName(value = "borrowerId", alternate = "borrowernumber")
    private String borrowerId;
    @Expose
    @SerializedName(value = "suspended", alternate = "suspend")
    private String suspended;
    @Expose
    @SerializedName(value = "queuePlace", alternate = "priority")
    private String queuePlace;
    @Expose
    @SerializedName(value = "itemType", alternate = "itemtype")
    private String itemType;
    @Expose
    @SerializedName(value = "expirationDate", alternate = "expirationdate")
    private String expirationDate;
    @Expose
    @SerializedName(value = "reserveDate", alternate = "reservedate")
    private String reserveDate;
    @Expose
    private String timestamp;
    @Expose
    private String lowestPriority;
    @Expose
    @SerializedName(value = "branchCode", alternate = "branchcode")
    private String branchCode;
    @Expose
    @SerializedName(value = "suspendUntil", alternate = "suspend_until")
    private String suspendUntil;
    @Expose
    @SerializedName(value = "waitingDate", alternate = "waitingdate")
    private String waitingDate;
    @Expose
    @SerializedName(value = "pickupNumber", alternate = "pickupnumber")
    private String pickupNumber;
    @Expose
    @SerializedName(value = "itemNumber", alternate = "itemnumber")
    private String itemNumber;
    @Expose
    @SerializedName(value = "status", alternate = "found")
    private String status;
    @Expose
    @SerializedName(value = "id", alternate = "reserve_id")
    private String id;
    @Expose
    @SerializedName(value = "reminderDate", alternate = "reminderdate")
    private String reminderDate;
    @Expose
    @SerializedName(value = "notificationDate", alternate = "notificationdate")
    private String notificationDate;
    @Expose
    @SerializedName(value = "cancellationDate", alternate = "cancellationdate")
    private String cancellationDate;
    @Expose
    @SerializedName(value = "reserveNotes", alternate = "reservenotes")
    private String reserveNotes;
    @Expose
    @SerializedName(value = "recordId", alternate = "biblionumber")
    private String recordId;

    public String getStatus() {
        return status;
    }

    public String getRecordId() {
        return recordId;
    }

    public String getQueuePlace() {
        return queuePlace;
    }

    public String getBranchCode() {
        return branchCode;
    }

    public String getId() {
        return id;
    }

    public String getSuspended() {
        return suspended;
    }

    public String getReserveDate() {
        return reserveDate;
    }

    public String getSuspendUntil() {
        return suspendUntil;
    }

    public String getPickupNumber() {
        return pickupNumber;
    }

    public String getWaitingDate() {
        return waitingDate;
    }

    public String getBorrowerId() {
        return borrowerId;
    }

    public void setBorrowerId(String borrowerId) {
        this.borrowerId = borrowerId;
    }

    public void setSuspended(String suspended) {
        this.suspended = suspended;
    }

    public void setQueuePlace(String queuePlace) {
        this.queuePlace = queuePlace;
    }

    public String getItemType() {
        return itemType;
    }

    public void setItemType(String itemType) {
        this.itemType = itemType;
    }

    public String getExpirationDate() {
        return expirationDate;
    }

    public void setExpirationDate(String expirationDate) {
        this.expirationDate = expirationDate;
    }

    public void setReserveDate(String reserveDate) {
        this.reserveDate = reserveDate;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public String getLowestPriority() {
        return lowestPriority;
    }

    public void setLowestPriority(String lowestPriority) {
        this.lowestPriority = lowestPriority;
    }

    public void setBranchCode(String branchCode) {
        this.branchCode = branchCode;
    }

    public void setSuspendUntil(String suspendUntil) {
        this.suspendUntil = suspendUntil;
    }

    public void setWaitingDate(String waitingDate) {
        this.waitingDate = waitingDate;
    }

    public void setPickupNumber(String pickupNumber) {
        this.pickupNumber = pickupNumber;
    }

    public String getItemNumber() {
        return itemNumber;
    }

    public void setItemNumber(String itemNumber) {
        this.itemNumber = itemNumber;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getReminderDate() {
        return reminderDate;
    }

    public void setReminderDate(String reminderDate) {
        this.reminderDate = reminderDate;
    }

    public String getNotificationDate() {
        return notificationDate;
    }

    public void setNotificationDate(String notificationDate) {
        this.notificationDate = notificationDate;
    }

    public String getCancellationDate() {
        return cancellationDate;
    }

    public void setCancellationDate(String cancellationDate) {
        this.cancellationDate = cancellationDate;
    }

    public String getReserveNotes() {
        return reserveNotes;
    }

    public void setReserveNotes(String reserveNotes) {
        this.reserveNotes = reserveNotes;
    }

    public void setRecordId(String recordId) {
        this.recordId = recordId;
    }
}
