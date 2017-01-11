package no.deichman.services.search;

import org.junit.Test;

import java.io.InputStreamReader;
import java.util.Collection;
import java.util.List;

public class NameIndexerTest {

    public static final int LENGTH = 100;
    public static final int WIDTH = LENGTH;

    @Test
    public void when_searching_for_name_returns_alphabetical_list_with_name_in_it() throws Exception {
        System.out.println("Creating index:");
        long now = System.currentTimeMillis();
        NameIndexer nameIndexer = new NameIndexer(new InputStreamReader(getClass().getResourceAsStream("/somePersons.json")));
        System.out.println(System.currentTimeMillis() - now);
        now = System.currentTimeMillis();
        List<NameEntry> nameEntries = nameIndexer.neighbourhoodOf("Hansen, T.", WIDTH);
        System.out.println(System.currentTimeMillis() - now);
        nameEntries.forEach(System.out::println);
        now = System.currentTimeMillis();
        nameEntries = nameIndexer.neighbourhoodOf("Åserud, Gunda", WIDTH);
        System.out.println(System.currentTimeMillis() - now);
        nameEntries.forEach(System.out::println);
        now = System.currentTimeMillis();
        nameEntries = nameIndexer.neighbourhoodOf("Abba, Gabba", WIDTH);
        System.out.println(System.currentTimeMillis() - now);
        nameEntries.forEach(System.out::println);

        nameIndexer.addNamedItem("Hansen, Aage Tarald", "http://data.deichman.no/person/p123456");
        nameEntries = nameIndexer.neighbourhoodOf("Gabrielsen, Gabriel", WIDTH);
        System.out.println(System.currentTimeMillis() - now);
        nameEntries.forEach(System.out::println);
    }

    @Test
    public void when_new_items_are_added_to_empty_index_the_list_is_sorted_correctly() throws Exception {
        NameIndexer nameIndexer = new NameIndexer();
        nameIndexer.addNamedItem("Frantzen, Aage Tarald", "http://data.deichman.no/person/p123456");
        nameIndexer.addNamedItem("Nilsen, Aage Tarald", "http://data.deichman.no/person/p123456");
        nameIndexer.addNamedItem("Hansen, Aage Tarald", "http://data.deichman.no/person/p123456");
        nameIndexer.addNamedItem("Olsen, Aage Tarald", "http://data.deichman.no/person/p123456");
        nameIndexer.addNamedItem("Karlsen, Aage Tarald", "http://data.deichman.no/person/p123456");
        nameIndexer.addNamedItem("Hansen, Aage Tarald", "http://data.deichman.no/person/p123456");
        nameIndexer.addNamedItem("Bertilsen, Aage Tarald", "http://data.deichman.no/person/p123456");
        nameIndexer.addNamedItem("Fjomsen, Aage Tarald", "http://data.deichman.no/person/p123456");
        nameIndexer.addNamedItem("Gakksen, Aage Tarald", "http://data.deichman.no/person/p123456");
        Collection<NameEntry> nameEntries = nameIndexer.getRegister(0, LENGTH);
        nameEntries.forEach(System.out::println);
        System.out.println();

        nameIndexer.removeNamedItem("Karlsen, Aage Tarald", "http://data.deichman.no/person/p123456");
        nameEntries = nameIndexer.getRegister(0, LENGTH);
        nameEntries.forEach(System.out::println);
        System.out.println();

        nameIndexer.removeNamedItem("Hansen, Aage Tarald", "http://data.deichman.no/person/p123456");
        nameEntries = nameIndexer.getRegister(0, LENGTH);
        nameEntries.forEach(System.out::println);
    }
}
