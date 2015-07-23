package no.deichman.services.utils;

import org.junit.Test;

import static no.deichman.services.utils.MimeType.JSONLD;
import static no.deichman.services.utils.MimeType.LDPATCHJSON;
import static org.junit.Assert.assertEquals;

public class MimeTypeTest {

    @Test
    public void test_json_ld(){
        assertEquals(JSONLD, "application/ld+json");
    }

    @Test
    public void test_ldpatch(){
        assertEquals(LDPATCHJSON, "application/ldpatch+json");
    }
}
