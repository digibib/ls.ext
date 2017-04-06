package no.deichman.services.circulation;

import com.google.gson.annotations.Expose;
import com.google.gson.annotations.SerializedName;

/**
 * Responsibility: receives raw holds format.
 */
public class RawHold {
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

    public final String getStatus() {
        return status;
    }

    public final String getRecordId() {
        return recordId;
    }

    public final String getQueuePlace() {
        return queuePlace;
    }

    public final String getBranchCode() {
        return branchCode;
    }

    public final String getId() {
        return id;
    }

    public final String getSuspended() {
        return suspended;
    }

    public final String getReserveDate() {
        return reserveDate;
    }

    public final String getSuspendUntil() {
        return suspendUntil;
    }

    public final String getPickupNumber() {
        return pickupNumber;
    }

    public final String getWaitingDate() {
        return waitingDate;
    }
}
