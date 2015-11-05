package no.deichman.services.entity.kohaadapter;

import org.junit.Before;
import org.junit.Test;

import javax.ws.rs.core.MultivaluedHashMap;
import javax.ws.rs.core.MultivaluedMap;

import static org.hamcrest.CoreMatchers.containsString;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertThat;

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

    @Test
    public void should_include_added_item() {
        mxp.createRecord();
        MultivaluedMap<Character, String> subfields = new MultivaluedHashMap<>();
        subfields.add('a', "bugga");
        mxp.addSubfield(MarcConstants.FIELD_952, subfields);
        assertThat(mxp.getMarcXml(), containsString("<marcxml:subfield code=\""+ MarcConstants.SUBFIELD_A +"\">bugga</marcxml:subfield>"));
    }

    @Test
    public void should_include_title() {
        mxp.createRecord();
        MultivaluedMap<Character, String> subfields = new MultivaluedHashMap<>();
        subfields.add('a', "bugga");
        mxp.addSubfield(MarcConstants.FIELD_245, subfields);
        assertThat(mxp.getMarcXml(), containsString("<marcxml:subfield code=\""+ MarcConstants.SUBFIELD_A +"\">bugga</marcxml:subfield>"));
    }
}
