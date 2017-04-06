package no.deichman.services.circulation;

import com.google.gson.annotations.Expose;
import com.google.gson.annotations.SerializedName;

import java.util.List;

/**
 * Responsibility: object for circulation profile data.
 */
public class CirculationProfile {
    @Expose
    private List<Loan> loans;
    @Expose
    @SerializedName(value = "reservations", alternate = "holds")
    private List<Reservation> holds;
    @Expose
    private List<Pickup> pickups;

    public final void setLoans(List<Loan> loans) {
        this.loans = loans;
    }

    public final void setHolds(List<Reservation> holds) {
        this.holds = holds;
    }

    public final void setPickups(List<Pickup> pickups) {
        this.pickups = pickups;
    }
}
