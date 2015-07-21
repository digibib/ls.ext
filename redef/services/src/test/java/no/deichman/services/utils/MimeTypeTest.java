package no.deichman.services.utils;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

import org.junit.Test;

public class MimeTypeTest {

    @Test
    public void test_mimetype_exists(){
        assertNotNull(new MimeType());
    }

    @Test
    public void test_json_ld(){
        assertEquals(MimeType.JSONLD,"application/ld+json");
    }

    @Test
    public void test_ldpatch(){
        assertEquals(MimeType.LDPATCHJSON,"application/ldpatch+json");
    }
}
