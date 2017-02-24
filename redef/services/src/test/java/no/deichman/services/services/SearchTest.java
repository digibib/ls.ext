package no.deichman.services.services;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;
import com.mashape.unirest.http.exceptions.UnirestException;
import com.mashape.unirest.request.HttpRequest;
import no.deichman.services.services.search.EmbeddedElasticsearchServer;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Ignore;
import org.junit.Test;

import static org.junit.Assert.assertThat;
import static org.junit.Assert.fail;
import static uk.co.datumedge.hamcrest.json.SameJSONAs.sameJSONAs;

/**
 * Responsibility: Test search result order.
 */
@Ignore
public class SearchTest {
    private static final int ONE_SECOND = 1000;
    private static final int ZERO = 0;
    private static final int ONE = 1;
    private static final int TWO = 2;
    private static final int THREE = 3;
    private static final int TEN_TIMES = 10;
    private static EmbeddedElasticsearchServer embeddedElasticsearchServer;
    private static String elasticSearchUrl;

    @BeforeClass
    public static void setup() throws Exception {
        setupElasticSearch();
        elasticSearchUrl =  "http://localhost:" + EmbeddedElasticsearchServer.getPort();
        populateSearchIndex();
    }

    @AfterClass
    public static void tearDown() throws Exception {
        embeddedElasticsearchServer.shutdown();
    }

    private static void setupElasticSearch() throws Exception {
        embeddedElasticsearchServer = new EmbeddedElasticsearchServer();
    }

    private static String generateWorkJson(String title, String creator) {
        JsonObject json = new JsonObject();
        if (title != null) {
            json.addProperty("mainTitle", title);
        }
        if (creator != null) {
            JsonObject name = new JsonObject();
            name.addProperty("name", creator);
            json.add("creator", name);
        }

        return json.toString();
    }

    private static void indexDocument(String type, String jsonData) {
        /*
        embeddedElasticsearchServer.getClient().prepareIndex("search", type)
                .setSource(jsonData)
                .execute()
                .actionGet();
                */
    }

    private static void populateSearchIndex() throws InterruptedException {
        indexDocument("work", generateWorkJson("When the Last Acorn is Found", "Deborah Latzke"));
        indexDocument("work", generateWorkJson("Lost. Found.", "Marsha Diane Arnold"));
        indexDocument("work", generateWorkJson("When I Found You", "Catherine Ryan Hyde"));
        indexDocument("work", generateWorkJson("I", "Anonymous"));
        indexDocument("work", generateWorkJson("I, robot", "Isaac Asimov"));
        indexDocument("work", generateWorkJson("Cats With Guns", "Jonathan Parkyn"));
        indexDocument("work", generateWorkJson("V for Vendetta", "David Lloyd"));
        indexDocument("work", generateWorkJson("Of Cowards and True Men", "Rob Miech"));
        indexDocument("work", generateWorkJson("Apocalypse Cow", "Michael Logan"));
    }

    private com.google.gson.JsonArray searchDocument(String type, String query, int numberOfExpectedResults) throws UnirestException, InterruptedException {
        int attempts = TEN_TIMES;
        do {
            HttpRequest request = Unirest.get(elasticSearchUrl + "/search/" + type + "/_search").queryString("q", "work.mainTitle=" + query);
            HttpResponse<?> response = request.asJson();
            JsonObject json = new Gson().fromJson(response.getBody().toString(), JsonObject.class);
            com.google.gson.JsonArray results = new com.google.gson.JsonArray();
            json.getAsJsonObject("hits").getAsJsonArray("hits").forEach(hit -> results.add(hit.getAsJsonObject().get("_source")));
            if (results.size() != numberOfExpectedResults) {
                Thread.sleep(ONE_SECOND);
            } else {
                return results;
            }

        } while (attempts-- > 0);
        fail("Should have found the correct number of hits by now");
        return null; // Will never get here
    }

    @Test
    public void search_should_return_hits_with_single_character_in_title() throws Exception {
        com.google.gson.JsonArray results = searchDocument("work", "i", THREE);
        if (results != null) {
            assertJsonSimilar(results.get(ZERO).toString(), generateWorkJson("I", null));
            assertJsonSimilar(results.get(ONE).toString(), generateWorkJson("I, robot", null));
            assertJsonSimilar(results.get(TWO).toString(), generateWorkJson("When I Found You", null));
        } else {
            throw new Exception("You made a mess int the test");
        }

    }

    @Test
    public void search_should_return_hits_when_searching_for_multiple_words() throws Exception {
        com.google.gson.JsonArray results = searchDocument("work", "when found", THREE);
        if (results != null) {
            assertJsonSimilar(results.get(ZERO).toString(), generateWorkJson("When I Found You", null));
            assertJsonSimilar(results.get(ONE).toString(), generateWorkJson("When the Last Acorn is Found", null));
            assertJsonSimilar(results.get(TWO).toString(), generateWorkJson("Lost. Found.", null));
        } else {
            throw new Exception("You made a mess in the test");
        }

        results = searchDocument("work", "found when", THREE);
        if (results != null) {
            assertJsonSimilar(results.get(ZERO).toString(), generateWorkJson("When I Found You", null));
            assertJsonSimilar(results.get(ONE).toString(), generateWorkJson("When the Last Acorn is Found", null));
            assertJsonSimilar(results.get(TWO).toString(), generateWorkJson("Lost. Found.", null));
        } else {
            throw new Exception("You made a mess in the test");
        }
    }

    private void assertJsonSimilar(String actual, String expected) {
        assertThat(actual, sameJSONAs(expected).allowingExtraUnexpectedFields().allowingAnyArrayOrdering());
    }

}
