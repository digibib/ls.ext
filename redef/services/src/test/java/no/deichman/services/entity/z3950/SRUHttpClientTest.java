package no.deichman.services.entity.z3950;

import org.junit.Test;

import java.io.IOException;
import java.net.MalformedURLException;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

/**
 * Responsibility: Test the SRU http client.
 */
public class SRUHttpClientTest {
    private SRUServiceMock sruServiceMock = new SRUServiceMock();

    @Test
    public void test_getting_setting() throws MalformedURLException {
        String host = "http://127.0.0.2";

        SRUHttpClient sruHttpClient = new SRUHttpClient();
        sruHttpClient.setEndpoint(host);
        assertEquals(host, sruHttpClient.getEndpoint());
    }

    @Test
    public void test_it_gets_a_single_MARC_record_by_isbn() throws IOException {
        sruServiceMock.getSingleMarcRecordExpectation();
        SRUHttpClient sruHttpClient = new SRUHttpClient(String.format("http://localhost:%d/sru?version=1.1", sruServiceMock.getPort()));
        SearchResultInfo response = sruHttpClient.getByField("bibbi", "123123123", "isbn");
        assertTrue(response.getMarcXmlContent().contains("Dostojevskij, Fjodor Mikhajlovitsj"));
    }

    @Test
    public void test_it_gets_a_single_MARC_record_by_ean() throws IOException {
        sruServiceMock.getSingleMarcRecordExpectation();
        SRUHttpClient sruHttpClient = new SRUHttpClient(String.format("http://localhost:%d/sru?version=1.1", sruServiceMock.getPort()));
        SearchResultInfo response = sruHttpClient.getByField("bibbi", "123123123", "ean");
        assertTrue(response.getMarcXmlContent().contains("Dostojevskij, Fjodor Mikhajlovitsj"));
    }
}
