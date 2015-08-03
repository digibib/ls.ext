package no.deichman.services.marc;

import static org.junit.Assert.assertNotNull;

import org.junit.Before;
import org.junit.Test;

public class MarcXmlProviderTest {

    private MarcXmlProvider mxp;

    @Before
    public void setup() {
        mxp = new MarcXmlProvider();
    }

    @Test
    public void constructor_exists() {
        assertNotNull(new MarcXmlProvider());
    }

    @Test
    public void creates_an_empty_record() {
        mxp.createRecord();
        assertNotNull(mxp.getRecord());
    }

    @Test
    public void serialize_a_record_as_marcxml() {
        mxp.createRecord();
        assertNotNull(mxp.getMarcXml());
    }

}
