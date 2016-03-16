package no.deichman.services.uridefaults;

import org.junit.Test;


import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

public class XURITest {
    private String baseURI = BaseURI.LOCAL_BASE_URI_ROOT;

    @Test
    public void has_default_constructor() throws Exception {
        assertNotNull("Could not find default constructor", new XURI(baseURI + "publication/p0123123121"));
    }

    @Test
    public void default_constructor_for_uri_elements() throws Exception {
        String uri = baseURI;
        String type = "work";
        String id = "w123123";
        XURI xuri = new XURI(uri, type, id);
        String fullURI = uri + type + "/" + id;
        assertEquals("URI was not set", xuri.getUri(), fullURI);
        assertEquals("Type was not set", xuri.getType(), "work");
        assertEquals("ID was not set", xuri.getId(), "w123123");    }

    @Test
    public void should_accept_return_XURI() throws Exception {
        String uri = baseURI + "work/w123123";
        XURI xuri = new XURI(uri);
        assertEquals("URI was not set", xuri.getUri(), uri);
        assertEquals("Type was not set", xuri.getType(), "work");
        assertEquals("ID was not set", xuri.getId(), "w123123");
    }

    @Test(expected=Exception.class)
    public void fails_when_uri_does_not_follow_path_part_baseUri_pattern() throws Exception {
        new XURI(baseURI + "thisShouldFail/p0123123123");
    }

    @Test(expected=Exception.class)
    public void fails_when_id_does_not_follow_pattern() throws Exception {
        new XURI(baseURI + "work/THIS_SHOULD_FAIL");
    }

    @Test
    public void can_get_uri() throws Exception {
        String uri = baseURI + "work/w124124124";
        XURI xuri = new XURI(uri);
        assertEquals("URIs did not match", uri, xuri.getUri());
    }

}
