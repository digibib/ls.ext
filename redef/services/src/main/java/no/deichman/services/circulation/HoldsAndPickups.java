package no.deichman.services.circulation;

import java.util.List;

/**
 * Responsibility: contain holds and pickups.
 */
public class HoldsAndPickups {

    private List<Reservation> holds;
    private List<Pickup> pickups;

    public final List<Reservation> getHolds() {
        return holds;
    }

    public final void setPickups(List<Pickup> pickups) {
        this.pickups = pickups;
    }

    public final void setHolds(List<Reservation> holds) {
        this.holds = holds;
    }

    public final List<Pickup> getPickups() {
        return pickups;
    }
}
