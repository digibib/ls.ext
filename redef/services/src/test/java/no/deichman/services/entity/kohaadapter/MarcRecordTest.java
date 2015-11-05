package no.deichman.services.entity.kohaadapter;

import org.junit.Before;
import org.junit.Test;

import static org.hamcrest.CoreMatchers.containsString;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertThat;

public class MarcRecordTest {

    private MarcRecord marcRecord;

    @Before
    public void setup() {
        marcRecord = new MarcRecord();
    }

    @Test
    public void constructor_exists() {
        assertNotNull(new MarcRecord());
    }

    @Test
    public void creates_an_empty_record() {
        assertNotNull(marcRecord.getRecord());
    }

    @Test
    public void serialize_a_record_as_marcxml() {
        assertNotNull(marcRecord.getMarcXml());
    }

    @Test
    public void should_include_added_item() {
        MarcField marcField = marcRecord.newDataField(MarcConstants.FIELD_952);
        marcField.addSubfield('a', "bugga");
        marcRecord.addMarcField(marcField);
        assertThat(marcRecord.getMarcXml(), containsString("<marcxml:subfield code=\"" + MarcConstants.SUBFIELD_A + "\">bugga</marcxml:subfield>"));
    }

    @Test
    public void should_include_title() {
        MarcField marcField = marcRecord.newDataField(MarcConstants.FIELD_245);
        marcField.addSubfield('a', "bugga");
        marcRecord.addMarcField(marcField);
        assertThat(marcRecord.getMarcXml(), containsString("<marcxml:subfield code=\"" + MarcConstants.SUBFIELD_A + "\">bugga</marcxml:subfield>"));
    }
}
