package no.deichman.services.services.search;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.elasticsearch.action.admin.indices.exists.indices.IndicesExistsResponse;
import org.elasticsearch.client.Client;
import org.elasticsearch.common.settings.Settings;
import org.elasticsearch.node.Node;

import java.io.File;
import java.io.IOException;

import static org.elasticsearch.node.NodeBuilder.nodeBuilder;
import static org.junit.Assert.assertTrue;

/**
 * Responsibility: An embedded elasticsearch server for test purposes.
 */
public final class EmbeddedElasticsearchServer {
    private static final String DEFAULT_DATA_DIRECTORY = "/var/tmp/target/elasticsearch-data";
    private static EmbeddedElasticsearchServer server;
    private final Node node;
    private final String dataDirectory;

    private EmbeddedElasticsearchServer() throws Exception {
        this(DEFAULT_DATA_DIRECTORY);
    }

    private EmbeddedElasticsearchServer(String dataDirectory) throws Exception {
        this.dataDirectory = dataDirectory;
        new File(dataDirectory).mkdirs();
        Settings.Builder elasticsearchSettings;
        elasticsearchSettings = Settings.settingsBuilder()
                .put("http.enabled", "true")
                .put("path.home", ".")
                .put("path.data", dataDirectory)
                .put("number_of_shards", 1);

        node = nodeBuilder()
                .local(true)
                .settings(elasticsearchSettings.build())
                .node();

        IndicesExistsResponse existsResponse = getClient().admin().indices().prepareExists("search").execute().actionGet();
        if (existsResponse.isExists()) {
            assertTrue(getClient().admin().indices().prepareDelete("search").execute().actionGet().isAcknowledged());
        }
        String settings = IOUtils.toString(getClass().getResourceAsStream("/search_index.json"), "UTF-8");
        assertTrue(getClient().admin().indices().prepareCreate("search").setSource(settings).execute().actionGet().isAcknowledged());

        prepareMappingOf("person");
        prepareMappingOf("work");
        prepareMappingOf("corporation");
        prepareMappingOf("serial");
        prepareMappingOf("subject");
        prepareMappingOf("genre");
        prepareMappingOf("publication");
        prepareMappingOf("instrument");
        prepareMappingOf("compositiontype");
    }

    private void prepareMappingOf(String type) throws IOException {
        String mapping = IOUtils.toString(getClass().getResourceAsStream("/" + type + "_mapping.json"), "UTF-8");
        assertTrue(getClient().admin().indices()
                .preparePutMapping("search").setSource(mapping)
                .setType(type).execute().actionGet().isAcknowledged());
    }

    public static EmbeddedElasticsearchServer getInstance() throws Exception {
        if (server == null) {
            server = new EmbeddedElasticsearchServer();
        }

        return server;
    }

    public Client getClient() {
        return node.client();
    }

    public void shutdown() throws Exception {
        getClient().admin().indices().prepareDelete("search").execute().actionGet();
        node.close();
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
