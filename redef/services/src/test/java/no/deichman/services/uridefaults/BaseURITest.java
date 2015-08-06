package no.deichman.services.uridefaults;

import org.junit.Test;

import static org.junit.Assert.assertEquals;

public class BaseURITest {
    private BaseURI baseURI = BaseURI.local();

    @Test
    public void canGetWorkURI() {
        String base = baseURI.work();
        assertEquals("http://deichman.no/work/", base);
    }

    @Test
    public void canGetPublicationURI() {
        String base = baseURI.publication();
        assertEquals("http://deichman.no/publication/", base);
    }
}
