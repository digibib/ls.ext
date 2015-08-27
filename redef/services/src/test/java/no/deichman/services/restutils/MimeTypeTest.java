package no.deichman.services.restutils;

import org.junit.Test;

import static no.deichman.services.restutils.MimeType.LDPATCH_JSON;
import static org.junit.Assert.assertEquals;

public class MimeTypeTest {

    @Test
    public void test_json_ld(){
        assertEquals(MimeType.LD_JSON, "application/ld+json");
    }

    @Test
    public void test_ldpatch(){
        assertEquals(LDPATCH_JSON, "application/ldpatch+json");
    }
}
