package no.deichman.services.circulation;

import com.google.gson.annotations.Expose;
import com.google.gson.annotations.SerializedName;

/**
 * Responsibility: Contain pickup data.
 */
public class Pickup extends CirculationObjectBase {
    @Expose
    @SerializedName(value = "pickupNumber", alternate = "pickupnumber")
    private String pickupNumber;
    @Expose
    @SerializedName(value = "expirationDate", alternate = "expirationdate")
    private String expirationDate;

    public final void setExpirationDate(String expirationDate) {
        this.expirationDate = expirationDate;
    }

    public final void setPickupNumber(String pickupNumber) {
        this.pickupNumber = pickupNumber;
    }
}
