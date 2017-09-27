package no.deichman.services.entity.external;

import com.google.gson.annotations.SerializedName;

import java.util.Map;

import static com.google.common.collect.ImmutableMap.of;

/**
 * Responsibility: handle mappnig of events.
 */
public class Event extends ExternalDataObject {
    @SerializedName("deichman:place")
    private Map<String, String> place;

    @SerializedName("deichman:date")
    private String date;

    @SerializedName("deichman:number")
    private String number;

    public Event(String eventId, String prefLabel) {
        super(eventId, prefLabel);
    }

    @Override
    protected final void assignType() {
        setType("deichman:Event");
    }

    public final void setPlace(ExternalDataObject place) {
        this.place = of("@id", place.getId());
    }

    public final void setDate(String date) {
        this.date = date;
    }

    public final void setNumber(String number) {
        this.number = number;
    }
}
