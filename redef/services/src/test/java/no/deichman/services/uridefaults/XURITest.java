package no.deichman.services.uridefaults;

import no.deichman.services.entity.EntityType;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdf.model.ResourceFactory;
import org.junit.Test;


import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

public class XURITest {
    private static final int FIVE = 5;
    @Test
    public void getUri() throws Exception {
        String uri = BaseURI.work() + "w123123";
        XURI xuri = new XURI(uri);
        assertEquals(uri, xuri.getUri());
    }

    @Test
    public void testGetType() throws Exception {
        String uri = BaseURI.work() + "w99999991";
        XURI xuri = new XURI(uri);
        assertEquals("work", xuri.getType());
    }

    @Test
    public void testGetTypeAsEntityType() throws Exception {
        String uri = BaseURI.work() + "w77763234";
        XURI xuri = new XURI(uri);
        assertEquals(EntityType.WORK, xuri.getTypeAsEntityType());
    }

    @Test
    public void testGetId() throws Exception {
        String id = "w77763234";
        String uri = BaseURI.work() + id;
        XURI xuri = new XURI(uri);
        assertEquals(id, xuri.getId());
    }

    @Test
    public void testGetPath() throws Exception {
        String id = "w543432123";
        String uri = BaseURI.work() + id;
        XURI xuri = new XURI(uri);
        assertEquals("/work/" + id, xuri.getPath());
    }

    @Test
    public void getAsResource() throws Exception {
        String uri = BaseURI.work() + "w998889128";
        Resource resource = ResourceFactory.createResource(uri);
        XURI xuri = new XURI(uri);
        assertEquals(resource, xuri.getAsResource());
    }

    @Test
    public void testToString() throws Exception {
        String uri = BaseURI.work() + "w5434123599";
        XURI xuri = new XURI(uri);
        assertEquals(uri, xuri.toString());
    }

    @Test
    public void equals() throws Exception {
        String uri = BaseURI.work() + "w5434123599";
        XURI xuri = new XURI(uri);
        assertTrue(xuri.equals(new XURI(uri)));
    }

    @Test
    public void compareTo() throws Exception {
        String uri1 = BaseURI.work() + "w5434123599";
        String uri2 = BaseURI.work() + "w0909090909";
        XURI xuri1 = new XURI(uri1);
        XURI xuri2 = new XURI(uri2);
        assertEquals(0, xuri1.compareTo(new XURI(uri1)));
        assertEquals(FIVE, xuri1.compareTo(xuri2));
    }

    @Test
    public void has_default_constructor() throws Exception {
        assertNotNull("Could not find default constructor", new XURI(BaseURI.publication() + "p0123123121"));
    }

    @Test
    public void default_constructor_for_uri_elements() throws Exception {
           String type = "work";
        String id = "w123123";
        XURI xuri = new XURI(BaseURI.root(), type, id);
        String fullURI = BaseURI.root() + type + "/" + id;
        assertEquals("URI was not set", xuri.getUri(), fullURI);
        assertEquals("Type was not set", xuri.getType(), "work");
        assertEquals("ID was not set", xuri.getId(), "w123123");    }

    @Test
    public void should_accept_return_XURI() throws Exception {
        String uri = BaseURI.work() + "w123123";
        XURI xuri = new XURI(uri);
        assertEquals("URI was not set", xuri.getUri(), uri);
        assertEquals("Type was not set", xuri.getType(), "work");
        assertEquals("ID was not set", xuri.getId(), "w123123");
    }

    @Test(expected=Exception.class)
    public void fails_when_uri_does_not_follow_path_part_baseUri_pattern() throws Exception {
        new XURI(BaseURI.root() + "thisShouldFail/p0123123123");
    }

    @Test(expected=Exception.class)
    public void fails_when_id_does_not_follow_pattern() throws Exception {
        new XURI(BaseURI.work() + "THIS_SHOULD_FAIL");
    }

    @Test
    public void can_get_uri() throws Exception {
        String uri = BaseURI.work() + "w124124124";
        XURI xuri = new XURI(uri);
        assertEquals("URIs did not match", uri, xuri.getUri());
    }

}
