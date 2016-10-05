package no.deichman.services.restutils;

import javax.ws.rs.core.MediaType;

/**
 * Responsibility: TODO.
 */
public final class MimeType {

    public static final String UTF_8 = ";" + MediaType.CHARSET_PARAMETER + "=utf-8";

    public static final String LD_JSON = "application/ld+json";
    public static final String LDPATCH_JSON = "application/ldpatch+json";
    public static final String NTRIPLES = "application/n-triples";
    public static final String TURTLE = "text/turtle";
    public static final String JSON = MediaType.APPLICATION_JSON;
    public static final String PLAIN = MediaType.TEXT_PLAIN;

    public static final String DEFAULT = ";qs=1";
    public static final String QS_0_7 = ";qs=0.7";

    private MimeType() {}

}
