package no.deichman.services.entity.z3950;

import no.deichman.services.uridefaults.BaseURI;
import org.junit.Test;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

/**
 * Responsibility: Test the Z3950 http client.
 */
public class Z3950HttpClientTest {

    private static final int THREE_THOUSAND = 3000;
    private Z3950ServiceMock z3950ServiceMock = new Z3950ServiceMock();

    @Test
    public void test_constructor_sets_default_baseUri_and_port() throws MalformedURLException, URISyntaxException {
        Z3950HttpClient z3950HttpClient = new Z3950HttpClient();
        URI baseUri = new URI(BaseURI.remote().getBaseUriRoot());
        assertEquals("http://" + baseUri.getHost(), z3950HttpClient.getBaseURI());
        assertNotNull(z3950HttpClient.getProxyPort());
    }

    @Test
    public void test_getting_setting() throws MalformedURLException {
        String host = "http://127.0.0.2";

        Z3950HttpClient z3950HttpClient = new Z3950HttpClient();

        z3950HttpClient.setBaseURI(host);
        z3950HttpClient.setPort(THREE_THOUSAND);

        assertEquals(host, z3950HttpClient.getBaseURI());
        assertEquals(THREE_THOUSAND, z3950HttpClient.getProxyPort());
    }

    @Test
    public void test_constructor_with_baseuri_and_port() {
        String localhost = "http://127.0.0.1";
        Z3950HttpClient z3950HttpClient = new Z3950HttpClient(localhost, THREE_THOUSAND);
        assertEquals(localhost, z3950HttpClient.getBaseURI());
        assertEquals(THREE_THOUSAND, z3950HttpClient.getProxyPort());
    }

    @Test
    public void test_constructor_with_url() throws MalformedURLException {
        String url = "http://192.0.0.1:" + THREE_THOUSAND;

        Z3950HttpClient z3950HttpClient = new Z3950HttpClient(url);

        assertEquals(THREE_THOUSAND, z3950HttpClient.getProxyPort());
        assertEquals("http://192.0.0.1", z3950HttpClient.getBaseURI());
    }

    @Test
    public void test_it_gets_a_single_MARC_record() throws IOException {
        z3950ServiceMock.getSingleMarcRecordExpectation();
        Z3950HttpClient z3950HttpClient = new Z3950HttpClient("http://localhost", z3950ServiceMock.getPort());
        String response = z3950HttpClient.get("bibbi", "123123123");
        assertTrue(response.contains("Eksempel Eksempelsen"));
    }
}
