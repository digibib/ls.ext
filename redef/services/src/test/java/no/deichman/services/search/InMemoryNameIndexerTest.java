package no.deichman.services.search;

import org.junit.Test;

import java.io.InputStreamReader;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.core.IsEqual.equalTo;

public class InMemoryNameIndexerTest {
    public static final String[] EXPECTED_TEST_DATA_1 = {
            "Abelsen, Heidi|http://data.deichman.no/uri/h13322200",
            "Eriksen, Kari|http://data.deichman.no/uri/h13322200",
            "Hansen, Johnny|http://data.deichman.no/uri/h13322200",
            "Hansen, Åge|http://data.deichman.no/uri/h17607100",
            "Hansen, Aage|http://data.deichman.no/uri/h15343300",
            "Hansen, Aage Daniel|http://data.deichman.no/uri/h24785100",
            "Hansen, Aase|http://data.deichman.no/uri/h13322200",
            "Karlsen, Johnny|http://data.deichman.no/uri/h13322200",
            "Karlsen, Kai|http://data.deichman.no/uri/h13322200",
            "Karlsen, Kai-Tommy|http://data.deichman.no/uri/h13322202",
            "Olderbolle, Felix|http://data.deichman.no/uri/h13322200",
            "Olsen Johnny|http://data.deichman.no/uri/h17221900",
            "Pettersen, Frans|http://data.deichman.no/uri/h28940200",
            "Aagerkarlsen, Karl|http://data.deichman.no/uri/h13322200",
            "Åleskjær, Aage|http://data.deichman.no/uri/h13322200"
    };

    public static final String[] EXPECTED_TEST_DATA_2 = {
            "Bertilsen, Aage Tarald|http://data.deichman.no/person/p123456",
            "Fjomsen, Aage Tarald|http://data.deichman.no/person/p123456",
            "Frantzen, Aage Tarald|http://data.deichman.no/person/p123456",
            "Gakksen, Aage Tarald|http://data.deichman.no/person/p123456",
            "Hansen, Aage Tarald|http://data.deichman.no/person/p123456",
            "Karlsen, Aage Tarald|http://data.deichman.no/person/p123456",
            "Nilsen, Aage Tarald|http://data.deichman.no/person/p123456",
            "Olsen, Aage Tarald|http://data.deichman.no/person/p123456"
    };
    public static final int LENGTH = 100;
    public static final int SMALL_LENGTH = 10;

    @Test
    public void when_searching_for_name_returns_alphabetical_list_with_name_in_it() throws Exception {
        InMemoryNameIndexer nameIndexer = new InMemoryNameIndexer(new InputStreamReader(getClass().getResourceAsStream("/somePersons.json")));
        List<NameEntry> nameEntries = nameIndexer.neighbourhoodOf("Hansen, T.", LENGTH);
        assertThat(nameEntriesAsArray(nameEntries), equalTo(EXPECTED_TEST_DATA_1));
    }

    @Test
    public void when_searching_result_is_of_desired_size() throws Exception {
        InMemoryNameIndexer nameIndexer = new InMemoryNameIndexer(new InputStreamReader(getClass().getResourceAsStream("/somePersons.json")));
        assertThat(nameIndexer.neighbourhoodOf("Hansen, T.", SMALL_LENGTH).size(), equalTo(SMALL_LENGTH));
    }

    @Test
    public void when_searching_with_size_1_correct_entry_is_returned() throws Exception {
        InMemoryNameIndexer nameIndexer = new InMemoryNameIndexer(new InputStreamReader(getClass().getResourceAsStream("/somePersons.json")));
        //"Karlsen, Johnny", "Hansen, Aase",
        Arrays.stream(new String[]{
                "Hansen, Aase",
                "Karlsen, Johnny",
                "Eriksen, Kari",
                "Olderbolle, Felix"
        }).forEach(name -> {
            List<NameEntry> nameEntries = nameIndexer.neighbourhoodOf(name, 1);
            assertThat(nameEntries.size(), equalTo(1));
            assertThat(nameEntries.get(0).getName(), equalTo(name));
        });
    }

    @Test
    public void when_new_items_are_added_to_empty_index_the_list_is_sorted_correctly() throws Exception {
        InMemoryNameIndexer nameIndexer = new InMemoryNameIndexer();
        nameIndexer.addNamedItem("Frantzen, Aage Tarald", "http://data.deichman.no/person/p123456");
        nameIndexer.addNamedItem("Nilsen, Aage Tarald", "http://data.deichman.no/person/p123456");
        nameIndexer.addNamedItem("Hansen, Aage Tarald", "http://data.deichman.no/person/p123456");
        nameIndexer.addNamedItem("Olsen, Aage Tarald", "http://data.deichman.no/person/p123456");
        nameIndexer.addNamedItem("Karlsen, Aage Tarald", "http://data.deichman.no/person/p123456");
        nameIndexer.addNamedItem("Hansen, Aage Tarald", "http://data.deichman.no/person/p123456");
        nameIndexer.addNamedItem("Bertilsen, Aage Tarald", "http://data.deichman.no/person/p123456");
        nameIndexer.addNamedItem("Fjomsen, Aage Tarald", "http://data.deichman.no/person/p123456");
        nameIndexer.addNamedItem("Gakksen, Aage Tarald", "http://data.deichman.no/person/p123456");
        List<NameEntry> nameEntries = nameIndexer.neighbourhoodOf("Hansen, T.", LENGTH);
        assertThat(nameEntriesAsArray(nameEntries), equalTo(EXPECTED_TEST_DATA_2));
    }

    @Test
    public final void when_removing_a_name_the_list_is_shortened_accordingly() throws Exception {
        InMemoryNameIndexer nameIndexer = new InMemoryNameIndexer(new InputStreamReader(getClass().getResourceAsStream("/somePersons.json")));
        List<NameEntry> nameEntries = nameIndexer.neighbourhoodOf("", LENGTH);
        int initialSize = nameEntries.size();
        assertThat(initialSize, greaterThan(SMALL_LENGTH));
        nameIndexer.removeNamedItem("Karlsen, Kai-Tommy", "http://data.deichman.no/uri/h13322202");
        assertThat(nameIndexer.neighbourhoodOf("", LENGTH).size(), equalTo(initialSize - 1));
    }

    @Test
    public final void when_removing_a_name_with_wrong_uri_does_not_shorten_list() throws Exception {
        InMemoryNameIndexer nameIndexer = new InMemoryNameIndexer(new InputStreamReader(getClass().getResourceAsStream("/somePersons.json")));
        List<NameEntry> nameEntries = nameIndexer.neighbourhoodOf("", LENGTH);
        int initialSize = nameEntries.size();
        assertThat(initialSize, greaterThan(SMALL_LENGTH));
        nameIndexer.removeNamedItem("Karlsen, Kai-Tommy", "http://data.deichman.no/uri/h13423");
        assertThat(nameIndexer.neighbourhoodOf("", LENGTH).size(), equalTo(initialSize));
    }

    private Object[] nameEntriesAsArray(List<NameEntry> nameEntries) {
        return nameEntries.stream().map(nameEntry -> nameEntry.getName() + "|" + nameEntry.getUri()).collect(Collectors.toList()).toArray();
    }
}
