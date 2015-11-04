package no.deichman.services.entity.kohaadapter;

import org.junit.Ignore;
import org.junit.Test;

import javax.ws.rs.core.MultivaluedHashMap;
import javax.ws.rs.core.MultivaluedMap;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

public class MarcRecordTest {
    @Test
    public void should_create_an_empty_record() {
        assertNotNull(new MarcRecord());
    }


    @Ignore
    public void should_have_title() {
    }

    @Test
    public void should_filter_xxx() {
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


}
