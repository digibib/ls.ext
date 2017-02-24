package no.deichman.services.services.search;

import no.deichman.services.testutil.PortSelector;
import org.apache.commons.io.FileUtils;
import pl.allegro.tech.embeddedelasticsearch.EmbeddedElastic;
import pl.allegro.tech.embeddedelasticsearch.IndexSettings;

import java.io.File;
import java.io.IOException;

import static java.lang.ClassLoader.getSystemResourceAsStream;

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

        embeddedElastic = EmbeddedElastic.builder()
                .withElasticVersion("5.2.1")
                .withSetting("http.port", port)
                .withSetting("http.enabled", "true")
                .withSetting("path.home", ".")
                .withSetting("path.data", dataDirectory)
                .withPlugin("analysis-icu")
                .withIndex("search", IndexSettings.builder()
                        .withSettings(getSystemResourceAsStream("search_index.json"))
                        .withType("person", getSystemResourceAsStream("person_mapping.json"))
                        .withType("work", getSystemResourceAsStream("work_mapping.json"))
                        .withType("corporation", getSystemResourceAsStream("corporation_mapping.json"))
                        .withType("serial", getSystemResourceAsStream("serial_mapping.json"))
                        .withType("workSeries", getSystemResourceAsStream("workSeries_mapping.json"))
                        .withType("subject", getSystemResourceAsStream("subject_mapping.json"))
                        .withType("genre", getSystemResourceAsStream("genre_mapping.json"))
                        .withType("publication", getSystemResourceAsStream("publication_mapping.json"))
                        .withType("instrument", getSystemResourceAsStream("instrument_mapping.json"))
                        .withType("compositionType", getSystemResourceAsStream("compositionType_mapping.json"))
                        .withType("event", getSystemResourceAsStream("event_mapping.json"))
                        .build())
                .build()
                .start();
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
