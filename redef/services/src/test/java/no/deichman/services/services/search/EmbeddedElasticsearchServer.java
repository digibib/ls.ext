package no.deichman.services.services.search;

import no.deichman.services.testutil.PortSelector;
import org.apache.commons.io.FileUtils;
import org.apache.http.client.methods.HttpPut;
import org.apache.http.impl.client.CloseableHttpClient;
import pl.allegro.tech.embeddedelasticsearch.EmbeddedElastic;
import pl.allegro.tech.embeddedelasticsearch.IndexSettings;

import java.io.File;
import java.io.IOException;
import java.util.concurrent.TimeUnit;

import static java.lang.ClassLoader.getSystemResourceAsStream;
import static java.lang.System.getenv;
import static org.apache.http.impl.client.HttpClients.createDefault;

/**
 * Responsibility: An embedded elasticsearch server for test purposes.
 */
public final class EmbeddedElasticsearchServer {
    private static final String DEFAULT_DATA_DIRECTORY = "/var/tmp/target/elasticsearch-data";
    private static EmbeddedElastic embeddedElastic;
    private final String dataDirectory;
    private static int port;

    public EmbeddedElasticsearchServer() throws Exception {
        this(DEFAULT_DATA_DIRECTORY);
    }

    private EmbeddedElasticsearchServer(String dataDirectory) throws Exception {
        this.dataDirectory = dataDirectory;
        this.port = PortSelector.randomFree();
        new File(dataDirectory).mkdirs();

        IndexSettings idx = IndexSettings.builder()
                        .withSettings(getSystemResourceAsStream("search_index.json"))
                        .withType("person", getSystemResourceAsStream("person_mapping.json"))
                        .withType("publication", getSystemResourceAsStream("publication_mapping.json"))
                        .withType("work", getSystemResourceAsStream("work_mapping.json"))
                        .withType("corporation", getSystemResourceAsStream("corporation_mapping.json"))
                        .withType("serial", getSystemResourceAsStream("serial_mapping.json"))
                        .withType("workSeries", getSystemResourceAsStream("workSeries_mapping.json"))
                        .withType("subject", getSystemResourceAsStream("subject_mapping.json"))
                        .withType("genre", getSystemResourceAsStream("genre_mapping.json"))
                        .withType("instrument", getSystemResourceAsStream("instrument_mapping.json"))
                        .withType("compositionType", getSystemResourceAsStream("compositionType_mapping.json"))
                        .withType("event", getSystemResourceAsStream("event_mapping.json"))
                        .build();

        embeddedElastic = EmbeddedElastic.builder()
                .withElasticVersion("5.4.1")
                .withSetting("http.port", port)
                .withSetting("http.enabled", "true")
                .withSetting("path.home", ".")
                .withSetting("path.data", dataDirectory)
                .withStartTimeout(2, TimeUnit.MINUTES)
                .withEsJavaOpts("-Xms512m -Xmx512m")
                .withPlugin(getenv().getOrDefault("ES_ICU_PLUGIN_URL", "analysis-icu"))
                .withIndex("a", idx)
                .withIndex("b", idx)
                .build()
                .start();

        try (CloseableHttpClient httpclient = createDefault()) {
           httpclient.execute(new HttpPut("http://localhost:" + embeddedElastic.getHttpPort() + "/a/_alias/search"));

        }
    }

    public static EmbeddedElastic getClient() {
        return embeddedElastic;
    }


    public static Integer getPort() {
        return port;
    }

    public void shutdown() throws Exception {
        embeddedElastic.stop();
        deleteDataDirectory();
    }

    @Override
    protected void finalize() throws Throwable {
        deleteDataDirectory();
        super.finalize();
    }

    private void deleteDataDirectory() {
        try {
            FileUtils.deleteDirectory(new File(dataDirectory));
        } catch (IOException e) {
            throw new RuntimeException("Could not delete data directory of embedded elasticsearch server", e);
        }
    }
}
