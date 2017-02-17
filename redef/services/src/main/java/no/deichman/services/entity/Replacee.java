package no.deichman.services.entity;

import no.deichman.services.uridefaults.XURI;

/**
 * Responsibility: hold replacement data.
 */
public class Replacee {
    private String replacee;

    public Replacee() {}

    public final XURI getReplacee() throws Exception {
        return new XURI(replacee);
    }
}
