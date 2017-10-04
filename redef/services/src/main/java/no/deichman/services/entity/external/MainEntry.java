package no.deichman.services.entity.external;

/**
 * Created by kristoffer on 06.09.2016.
 */
public class MainEntry extends Contribution {
    public MainEntry() {
        super();
        addType("deichman:MainEntry");
    }

    public MainEntry(Named contributor, String id) {
        super(contributor, id);
        addType("deichman:MainEntry");
    }
}
