package no.deichman.services.entity.external;

import org.apache.jena.vocabulary.RDF;
import org.junit.Test;

import java.util.Map;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

/**
 * Responsibility: Test person class.
 */
public class PersonTest {

    private static final int NUMBER_THREE = 3;

    @Test
    public void it_has_constructor() {
        assertNotNull(new Person());
    }

    @Test
    public void it_has_overloaded_constructor() {
        assertNotNull(new Person("123123", "A. Name", "1971-", "n."));
    }

    @Test
    public void it_creates_map() {

        String id = "21321344";
        String name = "Rogers Roger";
        String dates = "1971-";
        String nationality = "n.";
        Person person = new Person(id, name, dates, nationality);
        assertEquals(person.getName(), name);
        Map<String, String> personMap = person.getPersonMap();
        assertTrue(personMap.containsValue(name));
        assertTrue(personMap.containsKey(RDF.type.getURI()));
        assertEquals(person.getBirthYear(), "1971");

    }

    @Test
    public void it_maps_dates() {
        Person person = new Person();
        person.setDates("1901-1999");
        assertEquals("1901", person.getBirthYear());
        assertEquals("1999", person.getDeathYear());

    }
}
