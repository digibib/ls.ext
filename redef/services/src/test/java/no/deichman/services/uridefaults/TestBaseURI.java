package no.deichman.services.uridefaults;

import static org.junit.Assert.assertEquals;

import org.junit.Test;

import no.deichman.services.uridefaults.BaseURIMock;

public class TestBaseURI {
    BaseURIMock bum = new BaseURIMock();

    @Test
    public void canGetBaseURI() {
        String base = bum.getBaseURI();
        assertEquals("http://deichman.no/", base);
    }

    @Test
    public void canGetWorkURI() {
        String base = bum.getWorkURI();
        assertEquals("http://deichman.no/work/", base);
    }

    @Test
    public void canGetPublicationURI() {
        String base = bum.getPublicationURI();
        assertEquals("http://deichman.no/publication/", base);
    }
}
