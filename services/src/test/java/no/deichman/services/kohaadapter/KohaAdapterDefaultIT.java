package no.deichman.services.kohaadapter;

import com.hp.hpl.jena.rdf.model.Model;
import static org.junit.Assert.assertNotNull;
import org.junit.Test;

/**
 *
 * @author sbd
 */
public class KohaAdapterDefaultIT {

    @Test
    public void should_be_logged_in() {
        KohaAdapterDefault instance = new KohaAdapterDefault();
        assertNotNull(instance.getCookies());
    }

    @Test
    public void should_return_biblio() {
        String manifestationId = "1";
        KohaAdapterDefault instance = new KohaAdapterDefault();
        Model expResult = null;
        Model result = instance.getBiblio(manifestationId);
        assertNotNull(result);
    }
}
