package no.deichman.services.entity.kohaadapter;

import org.apache.commons.io.IOUtils;
import org.junit.Test;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

public class KohaAdapterImplTest {

    private final KohaSvcMock kohaSvcMock = new KohaSvcMock();
    private final KohaAdapterImpl kohaAdapter = new KohaAdapterImpl("http://localhost:" + kohaSvcMock.getPort());

    @Test
    public void should_have_default_constructor() {
        assertNotNull(new KohaAdapterImpl());
    }

    @Test
    public void should_create_a_new_biblio() throws Exception {
        kohaSvcMock.addLoginExpectation();
        kohaSvcMock.addGetBiblioExpandedExpectation("626460", stringFromClassPathResource("biblio_expanded.json"));

        assertNotNull(kohaAdapter.getBiblio("626460"));
    }

    @Test
    public void should_return_new_biblio_ID() throws Exception {
        kohaSvcMock.addLoginExpectation();
        kohaSvcMock.addCreateNewBiblioExpectation("26");

        String biblioId = kohaAdapter.createNewBiblio();
        assertEquals("26", biblioId);
    }

    @Test
    public void should_return_raw_marc_xml() throws IOException {
        kohaSvcMock.addLoginExpectation();
        String expected = stringFromClassPathResource("ragde.marcxml");
        kohaSvcMock.addGetBiblioExpandedExpectation("626460", expected);

        assertEquals(expected, kohaAdapter.retrieveBiblioExpanded("626460"));
    }

    private String stringFromClassPathResource(String classPathResource) throws IOException {
        return IOUtils.toString(getClass().getClassLoader().getResourceAsStream(classPathResource), StandardCharsets.UTF_8);
    }
}
