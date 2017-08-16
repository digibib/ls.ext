package no.deichman.services.entity.onix;

import com.tectonica.jonix.onix3.Product;
import no.deichman.services.utils.ResourceReader;
import org.junit.Before;
import org.junit.Test;

import java.io.IOException;
import java.util.List;

import static junit.framework.TestCase.assertEquals;
import static junit.framework.TestCase.assertNotNull;

/**
 * Responsibility: Test OnixResourceAdapter.
 */
public class OnixResourceAdapterTest {

    private OnixResourceMock onixResourceMock;
    private String onixResourcePort;

    @Before
    public void setup() {
        onixResourceMock = new OnixResourceMock();
        onixResourcePort = "http://localhost:" + onixResourceMock.getPort() + "/";
    }

    @Test
    public void test_has_default_constructor() {
        assertNotNull(new OnixResourceAdapter());
    }

    @Test
    public void test_can_log_in() throws IOException {
        onixResourceMock.addLoginExpectation();
        OnixResourceAdapter onixResourceAdapter = new OnixResourceAdapter();
        onixResourceAdapter.setResource(onixResourcePort);
        onixResourceAdapter.setUserName("userMe");
        onixResourceAdapter.setPassword("asdsd");
        onixResourceAdapter.build();
        String content = onixResourceAdapter.execute();
        assertEquals("", content);
    }

    @Test
    public void test_can_get_data() throws IOException {
        onixResourceMock.addSearchExpectation();
        OnixResourceAdapter onixResourceAdapter = new OnixResourceAdapter();
        onixResourceAdapter.setResource(onixResourcePort);
        onixResourceAdapter.setUserName("bilbobaggins");
        onixResourceAdapter.setPassword("poachedSalmon");
        onixResourceAdapter.setQueryElement("title");
        onixResourceAdapter.setQueryString("de velvillige");
        onixResourceAdapter.build();
        String content = onixResourceAdapter.execute();
        assertEquals(new ResourceReader().readFile("onix_de_velvillige.xml"), content);
    }

    @Test
    public void text_can_extract_onix() {
        OnixResourceAdapter onixResourceAdapter = new OnixResourceAdapter();
        List<Product> productList = onixResourceAdapter.extractOnix(new ResourceReader().readFile("onix_de_velvillige.xml"));
        assertEquals("De velvillige", productList.get(0).descriptiveDetail.titleDetails.get(0).titleElements.get(0).getTitleTextValue());
    }

    @Test
    public void text_can_extract_multiple_onix_products() {
        OnixResourceAdapter onixResourceAdapter = new OnixResourceAdapter();
        List<Product> productList = onixResourceAdapter.extractOnix(new ResourceReader().readFile("onix_de_velvillige_2up.xml"));
        assertEquals("De velvillige", productList.get(0).descriptiveDetail.titleDetails.get(0).titleElements.get(0).getTitleTextValue());
        assertEquals("De velvillige", productList.get(1).descriptiveDetail.titleDetails.get(0).titleElements.get(0).getTitleTextValue());
    }
}
