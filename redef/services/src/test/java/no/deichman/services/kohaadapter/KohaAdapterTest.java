package no.deichman.services.kohaadapter;

import com.hp.hpl.jena.rdf.model.Model;
import static org.junit.Assert.assertNotNull;
import org.junit.Test;

public class KohaAdapterTest {

    @Test
    public void should_return_biblio() {
        String manifestationId = "1";
        KohaAdapterMock instance = new KohaAdapterMock();
        Model result = instance.getBiblio(manifestationId);
        assertNotNull(result);
    }
}
