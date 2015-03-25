package no.deichman.services.kohaadapter;

import com.hp.hpl.jena.rdf.model.Model;
import org.junit.After;
import org.junit.AfterClass;
import static org.junit.Assert.assertNotNull;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;

/**
 *
 * @author sbd
 */
public class KohaAdapterTest {
    
    public KohaAdapterTest() {
    }
    
    @BeforeClass
    public static void setUpClass() {
    }
    
    @AfterClass
    public static void tearDownClass() {
    }
    
    @Before
    public void setUp() {
    }
    
    @After
    public void tearDown() {
    }


    /**
     * Test of getBiblio method, of class KohaAdapterDefault.
     */
    @Test
    public void should_return_biblio() {
        System.out.println("getBiblio");
        String manifestationId = "1";
        KohaAdapterMock instance = new KohaAdapterMock();
        Model expResult = null;
        Model result = instance.getBiblio(manifestationId);
        assertNotNull(result);
        //assertFalse(result.isEmpty());
    }
    
}
