package no.deichman.services.entity.kohaadapter;

import org.junit.Before;
import org.junit.Test;

import static org.hamcrest.CoreMatchers.containsString;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotEquals;
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
    public void should_include_title() {
        MarcField marcField = MarcRecord.newDataField(MarcConstants.FIELD_245);
        marcField.addSubfield('a', "bugga");
        marcRecord.addMarcField(marcField);
        assertThat(marcRecord.getMarcXml(), containsString("<marcxml:subfield code=\"" + MarcConstants.SUBFIELD_A + "\">bugga</marcxml:subfield>"));
    }

    @Test
    public void marc_records_should_be_equal() {
        MarcRecord record1 = new MarcRecord();
        MarcField field1 = MarcRecord.newDataField("111");
        field1.addSubfield('a', "b");
        field1.addSubfield('c', "d");
        record1.addMarcField(field1);

        MarcRecord record2 = new MarcRecord();
        MarcField field2 = MarcRecord.newDataField("111");
        field2.addSubfield('c', "d");
        field2.addSubfield('a', "b");
        record2.addMarcField(field2);

        assertEquals(record1, record2);
    }

    @Test
    public void marc_records_should_not_be_equal() {
        MarcRecord record1 = new MarcRecord();
        MarcField field1 = MarcRecord.newDataField("111");
        field1.addSubfield('a', "b");
        field1.addSubfield('c', "NOT EQUAL");
        record1.addMarcField(field1);

        MarcRecord record2 = new MarcRecord();
        MarcField field2 = MarcRecord.newDataField("111");
        field2.addSubfield('c', "d");
        field2.addSubfield('a', "b");
        record2.addMarcField(field2);

        assertNotEquals(record1, record2);
    }

    @Test
    public void marc_records_should_be_equal2() {
        MarcRecord record1 = new MarcRecord();
        MarcField field1 = MarcRecord.newDataField("111");
        field1.addSubfield('a', "b");
        record1.addMarcField(field1);
        MarcField field2 = MarcRecord.newDataField("111");
        field2.addSubfield('c', "d");
        record1.addMarcField(field2);
        MarcField field3 = MarcRecord.newDataField("222");
        field3.addSubfield('e', "f");
        record1.addMarcField(field3);

        MarcRecord record2 = new MarcRecord();
        record2.addMarcField("222", 'e', "f");
        record2.addMarcField("111", 'c', "d");
        record2.addMarcField("111", 'a', "b");

        assertEquals(record1, record2);
    }

    @Test
    public void marc_records_should_not_be_equal2() {
        MarcRecord record1 = new MarcRecord();
        MarcField field1 = MarcRecord.newDataField("111");
        field1.addSubfield('a', "b");
        field1.addSubfield('x', "NOT_EQUAL");
        record1.addMarcField(field1);
        MarcField field2 = MarcRecord.newDataField("111");
        field2.addSubfield('c', "d");
        record1.addMarcField(field2);
        MarcField field3 = MarcRecord.newDataField("222");
        field3.addSubfield('e', "f");
        record1.addMarcField(field3);

        MarcRecord record2 = new MarcRecord();
        record2.addMarcField("222", 'e', "f");
        record2.addMarcField("111", 'c', "d");
        record2.addMarcField("111", 'a', "b");

        assertNotEquals(record1, record2);
    }
}
