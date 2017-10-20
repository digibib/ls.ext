package no.deichman.services.search;

import org.junit.Test;

import java.io.InputStreamReader;
import java.util.List;

import static java.util.Arrays.stream;
import static java.util.stream.Collectors.joining;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.core.IsEqual.equalTo;

public class InMemoryNameIndexerTest {
    private static final String[] EXPECTED_TEST_DATA_1 = {
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
            "Olsen, Johnny|http://data.deichman.no/uri/h17221900",
            "Olseng, Johnny|http://data.deichman.no/uri/h17221900",
            "Pettersen, Frans|http://data.deichman.no/uri/h28940200",
            "Aagerkarlsen, Karl|http://data.deichman.no/uri/h13322200",
            "Åleskjær, Aage|http://data.deichman.no/uri/h13322200"
    };

    private static final String[] EXPECTED_TEST_DATA_2 = {
            "Bertilsen, Aage Tarald|http://data.deichman.no/person/p123456",
            "Fjomsen, Aage Tarald|http://data.deichman.no/person/p123456",
            "Frantzen, Aage Tarald|http://data.deichman.no/person/p123456",
            "Gakksen, Aage Tarald|http://data.deichman.no/person/p123456",
            "Hansen, Aage Tarald|http://data.deichman.no/person/p123456",
            "Karlsen, Aage Tarald|http://data.deichman.no/person/p123456",
            "Nilsen, Aage Tarald|http://data.deichman.no/person/p123456",
            "Olsen, Aage Tarald|http://data.deichman.no/person/p123456"
    };

    private static final String[] EXPECTED_TEST_DATA_3 = {
            "Hansen, Mogens Herman, 1940-|http://data.deichman.no/person/p123456",
            "Hansen, Morten, 1910-|http://data.deichman.no/person/p123456",
            "Hansen, Morten, 1972-|http://data.deichman.no/person/p123456",
            "Hansen, Morten E.|http://data.deichman.no/person/p123456",
            "Hansen, Morten Løw, 1954-|http://data.deichman.no/person/p123456",
            "Hansen, Morten T.|http://data.deichman.no/person/p123456"
    };

    private static final String[] EXPECTED_TEST_DATA_4 = {
            "Historien om|http://data.deichman.no/workSeries/s123453",
            "Historien om (Spartacus)|http://data.deichman.no/workSeries/s123453",
            "Historien om Carl Hamilton|http://data.deichman.no/workSeries/s123453",
            "Historien om det moderne Norge 1945-2000|http://data.deichman.no/workSeries/s123453",
            "Historien om Eventyrlandet|http://data.deichman.no/workSeries/s123453",
            "Historien om jorda|http://data.deichman.no/workSeries/s123453",
            "Historien om Ragnar Herlaugsson|http://data.deichman.no/workSeries/s123453"
    };

    private static final String[] EXPECTED_TEST_DATA_5 = {
            "Arthur (britannisk sagnkonge)|http://data.deichman.no/person/p123456",
            "Arthur, Charles|http://data.deichman.no/person/p123456",
            "Arthur, David|http://data.deichman.no/person/p123456",
            "Arthur, Donald|http://data.deichman.no/person/p123456",
            "Arthur, Dorothy|http://data.deichman.no/person/p123456",
            "Arthur, Gael|http://data.deichman.no/person/p123456",
            "Arthur, Gillian|http://data.deichman.no/person/p123456",
            "Arthur, Jean, 1900-1991|http://data.deichman.no/person/p123456",
            "Arthur, Robert|http://data.deichman.no/person/p123456",
            "Arthur, Robert, 1925-|http://data.deichman.no/person/p123456",
            "Arthur, Sam|http://data.deichman.no/person/p123456",
            "Arthur-Nilson, Kerstin|http://data.deichman.no/person/p123456",
            "Arthurs, Tom|http://data.deichman.no/person/p123456"
    };

    private static final int LENGTH = 100;
    private static final int SMALL_LENGTH = 10;

    @Test
    public void when_searching_for_name_returns_alphabetical_list_with_name_in_it() throws Exception {
        InMemoryNameIndexer nameIndexer = new InMemoryNameIndexer(new InputStreamReader(getClass().getResourceAsStream("/somePersons.json")));
        List<NameEntry> nameEntries = nameIndexer.neighbourhoodOf("Hansen, T.", LENGTH);
        assertThat(nameEntriesAsArray(nameEntries), equalTo(stream(EXPECTED_TEST_DATA_1).collect(joining("\n"))));
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
        stream(new String[]{
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
        assertThat(nameEntriesAsArray(nameEntries), equalTo(stream(EXPECTED_TEST_DATA_2).collect(joining("\n"))));
    }

    @Test
    public void when_new_names_with_additional_fields_are_added_to_empty_index_the_list_is_sorted_correctly() throws Exception {
        InMemoryNameIndexer nameIndexer = new InMemoryNameIndexer();
        nameIndexer.addNamedItem("Hansen, Morten E.", "http://data.deichman.no/person/p123456");
        nameIndexer.addNamedItem("Hansen, Mogens Herman, 1940-", "http://data.deichman.no/person/p123456");
        nameIndexer.addNamedItem("Hansen, Morten T.", "http://data.deichman.no/person/p123456");
        nameIndexer.addNamedItem("Hansen, Morten Løw, 1954-", "http://data.deichman.no/person/p123456");
        nameIndexer.addNamedItem("Hansen, Morten, 1972-", "http://data.deichman.no/person/p123456");
        nameIndexer.addNamedItem("Hansen, Morten, 1910-", "http://data.deichman.no/person/p123456");
        List<NameEntry> nameEntries = nameIndexer.neighbourhoodOf("Hansen, T.", LENGTH);
        assertThat(nameEntriesAsArray(nameEntries), equalTo(stream(EXPECTED_TEST_DATA_3).collect(joining("\n"))));
    }

    @Test
    public void when_new_series_with_additional_fields_are_added_to_empty_index_the_list_is_sorted_correctly() throws Exception {
        InMemoryNameIndexer nameIndexer = new InMemoryNameIndexer();
        nameIndexer.addNamedItem("Historien om", "http://data.deichman.no/workSeries/s123453");
        nameIndexer.addNamedItem("Historien om Carl Hamilton", "http://data.deichman.no/workSeries/s123453");
        nameIndexer.addNamedItem("Historien om (Spartacus)", "http://data.deichman.no/workSeries/s123453");
        nameIndexer.addNamedItem("Historien om Eventyrlandet", "http://data.deichman.no/workSeries/s123453");
        nameIndexer.addNamedItem("Historien om Ragnar Herlaugsson", "http://data.deichman.no/workSeries/s123453");
        nameIndexer.addNamedItem("Historien om jorda", "http://data.deichman.no/workSeries/s123453");
        nameIndexer.addNamedItem("Historien om det moderne Norge 1945-2000", "http://data.deichman.no/workSeries/s123453");
        List<NameEntry> nameEntries = nameIndexer.neighbourhoodOf("Hansen, T.", LENGTH);
        assertThat(nameEntriesAsArray(nameEntries), equalTo(stream(EXPECTED_TEST_DATA_4).collect(joining("\n"))));
    }

    @Test
    public void when_even_more_names_with_additional_fields_are_added_to_empty_index_the_list_is_sorted_correctly() throws Exception {
        InMemoryNameIndexer nameIndexer = new InMemoryNameIndexer();
        nameIndexer.addNamedItem("Arthur, Charles", "http://data.deichman.no/person/p123456");
        nameIndexer.addNamedItem("Arthur, Donald", "http://data.deichman.no/person/p123456");
        nameIndexer.addNamedItem("Arthur, Dorothy", "http://data.deichman.no/person/p123456");
        nameIndexer.addNamedItem("Arthur (britannisk sagnkonge)", "http://data.deichman.no/person/p123456");
        nameIndexer.addNamedItem("Arthur, Gael", "http://data.deichman.no/person/p123456");
        nameIndexer.addNamedItem("Arthur, Jean, 1900-1991", "http://data.deichman.no/person/p123456");
        nameIndexer.addNamedItem("Arthur, Robert", "http://data.deichman.no/person/p123456");
        nameIndexer.addNamedItem("Arthur, David", "http://data.deichman.no/person/p123456");
        nameIndexer.addNamedItem("Arthur, Robert, 1925-", "http://data.deichman.no/person/p123456");
        nameIndexer.addNamedItem("Arthur, Gillian", "http://data.deichman.no/person/p123456");
        nameIndexer.addNamedItem("Arthur, Sam", "http://data.deichman.no/person/p123456");
        nameIndexer.addNamedItem("Arthur-Nilson, Kerstin", "http://data.deichman.no/person/p123456");
        nameIndexer.addNamedItem("Arthurs, Tom", "http://data.deichman.no/person/p123456");
        List<NameEntry> nameEntries = nameIndexer.neighbourhoodOf("Hansen, T.", LENGTH);
        assertThat(nameEntriesAsArray(nameEntries), equalTo(stream(EXPECTED_TEST_DATA_5).collect(joining("\n"))));
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

    private String nameEntriesAsArray(List<NameEntry> nameEntries) {
        return nameEntries.stream().map(nameEntry -> nameEntry.getName() + "|" + nameEntry.getUri()).collect(joining("\n"));
    }
}
