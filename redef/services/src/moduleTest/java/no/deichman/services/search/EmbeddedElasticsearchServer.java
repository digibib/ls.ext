package no.deichman.services.search;

import org.apache.commons.io.FileUtils;
import org.elasticsearch.client.Client;
import org.elasticsearch.common.settings.Settings;
import org.elasticsearch.node.Node;

import java.io.File;
import java.io.IOException;

import static org.elasticsearch.node.NodeBuilder.nodeBuilder;

/**
 * Responsibility: An embedded elasticsearch server for test purposes.
 */
public class EmbeddedElasticsearchServer {
    private static final String DEFAULT_DATA_DIRECTORY = "/var/tmp/target/elasticsearch-data";

    private final Node node;
    private final String dataDirectory;

    public EmbeddedElasticsearchServer() {
        this(DEFAULT_DATA_DIRECTORY);
    }

    public EmbeddedElasticsearchServer(String dataDirectory) {
            this.dataDirectory = dataDirectory;
        new File(dataDirectory).mkdirs();

        Settings.Builder elasticsearchSettings = Settings.settingsBuilder()
                .put("http.enabled", "true")
                .put("path.home", ".")
                .put("path.data", dataDirectory);

        node = nodeBuilder()
                .local(true)
                .settings(elasticsearchSettings.build())
                .node();
    }

    public final Client getClient() {
        return node.client();
    }

    public final void shutdown() {
        node.close();
        deleteDataDirectory();
    }

    private void deleteDataDirectory() {
        try {
            FileUtils.deleteDirectory(new File(dataDirectory));
        } catch (IOException e) {
            throw new RuntimeException("Could not delete data directory of embedded elasticsearch server", e);
        }
    }

}
