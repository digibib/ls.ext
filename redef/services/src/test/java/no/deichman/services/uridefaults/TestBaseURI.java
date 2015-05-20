package no.deichman.services.uridefaults;

import static org.junit.Assert.assertEquals;

import org.junit.Test;

import no.deichman.services.uridefaults.BaseURIMock;

public class TestBaseURI {
	
	@Test
	public void canGetBaseURI() {
        String base = BaseURIMock.getBaseURI();
        assertEquals("http://deichman.no/", base);
    }
	
	@Test
	public void canGetWorkURI() {
		String base = BaseURIMock.getWorkURI();
        assertEquals("http://deichman.no/work/", base);

	}
}
