package no.deichman.services.entity.kohaadapter;

import org.junit.Test;

import javax.ws.rs.core.MultivaluedHashMap;
import javax.ws.rs.core.MultivaluedMap;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotEquals;
import static org.junit.Assert.assertNotNull;

public class MarcRecordTest {
    @Test
    public void should_create_an_empty_record() {
        MarcRecord marcRecord = new MarcRecord();

        assertNotNull(marcRecord);
        assertNotNull(marcRecord.getFields());
        assertEquals(0, marcRecord.getFields().size());
    }

    @Test
    public void should_have_title() {
        MarcRecord marcRecord = new MarcRecord();
        marcRecord.addTitle("Titely title");
        MultivaluedMap<Character, String> expected = new MultivaluedHashMap<>();
        expected.add(MarcConstants.SUBFIELD_A, "Titely title");

        assertEquals(expected, marcRecord.fieldAsMap(MarcConstants.FIELD_245));
    }

    @Test
    public void should_get_specified_field_as_map() {
        MarcRecord marcRecord = new MarcRecord();
        marcRecord.addGroup("a", 'b', "c");
        marcRecord.addGroup("x", 'y', "z1");
        marcRecord.addGroup("x", 'y', "z2");

        MultivaluedMap<Character, String> expectedA = new MultivaluedHashMap<>();
        expectedA.add('b', "c");

        MultivaluedMap<Character, String> expectedX = new MultivaluedHashMap<>();
        expectedX.add('y', "z1");
        expectedX.add('y', "z2");

        assertEquals(expectedA, marcRecord.fieldAsMap("a"));
        assertEquals(expectedX, marcRecord.fieldAsMap("x"));
    }

    @Test
    public void marc_records_should_be_equal() {
        MarcRecord marcRecord1 = new MarcRecord();
        marcRecord1.addGroup("a", 'b', "c");
        marcRecord1.addGroup("x", 'y', "z1");

        MarcRecord marcRecord2 = new MarcRecord();
        marcRecord2.addGroup("a", 'b', "c");
        marcRecord2.addGroup("x", 'y', "z1");

        assertEquals(marcRecord1, marcRecord2);
    }

    @Test
    public void marc_records_should_not_be_equal() {
        MarcRecord marcRecord1 = new MarcRecord();
        marcRecord1.addGroup("a", 'b', "c");
        marcRecord1.addGroup("x", 'y', "z1");

        MarcRecord marcRecord2 = new MarcRecord();
        marcRecord2.addGroup("a", 'b', "NOT EQUAL");
        marcRecord2.addGroup("x", 'y', "z1");

        assertNotEquals(marcRecord1, marcRecord2);
    }
}
