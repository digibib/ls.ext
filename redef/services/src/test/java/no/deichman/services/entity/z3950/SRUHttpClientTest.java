package no.deichman.services.entity.z3950;

import org.junit.Test;

import java.io.IOException;

import static org.junit.Assert.assertTrue;

/**
 * Responsibility: Test the SRU http client.
 */
public class SRUHttpClientTest {
    private SRUServiceMock sruServiceMock = new SRUServiceMock();

    @Test
    public void test_it_gets_a_single_MARC_record_by_isbn() throws IOException {
        sruServiceMock.getSingleMarcRecordExpectation();
        SRUHttpClient sruHttpClient = new SRUHttpClient(String.format("http://localhost:%d/sru?version=1.1", sruServiceMock.getPort()));
        SearchResultInfo response = sruHttpClient.getByField("bibbi", "123123123", "isbn");
        final String marcXmlContent = response.getMarcXmlContent();
        assertTrue(marcXmlContent.contains("collection"));
        assertTrue(marcXmlContent.contains("Dostojevskij, Fjodor Mikhajlovitsj"));
    }

    @Test
    public void test_it_gets_a_single_MARC_record_by_ean() throws IOException {
        sruServiceMock.getSingleMarcRecordExpectation();
        SRUHttpClient sruHttpClient = new SRUHttpClient(String.format("http://localhost:%d/sru?version=1.1", sruServiceMock.getPort()));
        SearchResultInfo response = sruHttpClient.getByField("bibbi", "123123123", "ean");
        final String marcXmlContent = response.getMarcXmlContent();
        assertTrue(marcXmlContent.contains("collection"));
        assertTrue(marcXmlContent.contains("Dostojevskij, Fjodor Mikhajlovitsj"));
    }

    @Test
    public void test_it_gets_a_single_MARC_record_by_isbn_for_micromarc() throws IOException {
        sruServiceMock.getMicroMarcSingleMarcRecordExpectation();
        SRUHttpClient sruHttpClient = new SRUHttpClient(String.format("http://localhost:%d/mmwebapi/bibbi/6475/SRU?version=2.0", sruServiceMock.getPort()));
        SearchResultInfo response = sruHttpClient.getByField("bibbi", "123123123", "isbn");
        final String marcXmlContent = response.getMarcXmlContent();
        assertTrue(marcXmlContent.contains("collection"));
        assertTrue(marcXmlContent.contains("Verdens fineste julefortellinger"));
    }
}
