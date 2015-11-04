package no.deichman.services;

import no.deichman.services.entity.EntityResource;
import no.deichman.services.entity.ResourceBase;
import no.deichman.services.marc.MarcResource;
import no.deichman.services.ontology.AuthorizedValuesResource;
import no.deichman.services.ontology.OntologyResource;
import no.deichman.services.restutils.CORSResponseFilter;
import no.deichman.services.search.SearchResource;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.servlet.ServletContextHandler;
import org.eclipse.jetty.servlet.ServletHolder;
import org.glassfish.jersey.server.ServerProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import static java.util.Arrays.asList;

/**
 * Responsibility: Start application (using embedded web server).
 */
public final class App {
    private static final Logger LOG = LoggerFactory.getLogger(App.class);
    private static final int SERVICES_PORT_NO = 8005;
    private Server jettyServer;
    private final int port;
    private String kohaPort;
    private boolean inMemoryRDFRepository;
    private String elasticSearchUrl = System.getProperty("ELASTCSEARCH_URL", "http://localhost:9200");

    App(int port, String kohaPort, boolean inMemoryRDFRepository) {
        this.port = port;
        this.kohaPort = kohaPort;
        this.inMemoryRDFRepository = inMemoryRDFRepository;
    }

    private void startSync() throws Exception {
        try {
            startAsync();
            join();
        } finally {
            stop();
        }
    }

    void startAsync() throws Exception {
        ServletContextHandler context = new ServletContextHandler(ServletContextHandler.SESSIONS);
        context.setContextPath("/");

        jettyServer = new Server(port);
        jettyServer.setHandler(context);

        ServletHolder jerseyServlet = context.addServlet(
                org.glassfish.jersey.servlet.ServletContainer.class, "/*");
        jerseyServlet.setInitOrder(0);

        if(kohaPort != null) {
            jerseyServlet.setInitParameter(
                    ResourceBase.SERVLET_INIT_PARAM_KOHA_PORT,
                    kohaPort
            );
        }

        if(inMemoryRDFRepository) {
            jerseyServlet.setInitParameter(
                    ResourceBase.SERVLET_INIT_PARAM_IN_MEMORY_RDF_REPOSITORY,
                    String.valueOf(inMemoryRDFRepository)
            );
        }

        if (elasticSearchUrl != null) {
            jerseyServlet.setInitParameter(ResourceBase.ELASTIC_SEARCH_URL, elasticSearchUrl);
        }
        // Tells the Jersey Servlet which REST service/class to load.
        jerseyServlet.setInitParameter(ServerProperties.PROVIDER_CLASSNAMES,
                String.join(",", asList(
                        EntityResource.class.getCanonicalName(),
                        OntologyResource.class.getCanonicalName(),
                        SearchResource.class.getCanonicalName(),
                        AuthorizedValuesResource.class.getCanonicalName(),
                        MarcResource.class.getCanonicalName(),
                        CORSResponseFilter.class.getCanonicalName()
                )));

        jettyServer.start();
        LOG.info("App started on port: " + port);
    }

    private void join() throws InterruptedException {
        jettyServer.join();
    }

    void stop() throws Exception {
        LOG.info("Stopping App on port: " + port);
        try {
            jettyServer.stop();
        } finally {
            jettyServer.destroy();
        }
    }

    public static void main(String[] args) {
        App app = new App(SERVICES_PORT_NO, null, false);
        try {
            app.startSync();
        } catch (Exception e) {
            LOG.error("App failed to startSync:");
            e.printStackTrace(System.err);
        }
    }
}
