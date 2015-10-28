package no.deichman.services.entity.kohaadapter;

import org.junit.Before;
import org.junit.Test;

import java.util.HashMap;
import java.util.Map;

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
        Map<Character, String> subfields = new HashMap<>();
        subfields.put('a', "bugga");
        mxp.add952(subfields);
        assertThat(mxp.getMarcXml(), containsString("<marcxml:subfield code=\"a\">bugga</marcxml:subfield>"));
    }

    @Test
    public void should_include_title() {
        mxp.createRecord();
        Map<Character, String> subfields = new HashMap<>();
        subfields.put('a', "bugga");
        mxp.add245(subfields);
        assertThat(mxp.getMarcXml(), containsString("<marcxml:subfield code=\""+ MarcConstants.SUBFIELD_A +"\">bugga</marcxml:subfield>"));
    }
}
