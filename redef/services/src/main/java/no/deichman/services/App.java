package no.deichman.services;

import no.deichman.services.datasource.Datasource;
import no.deichman.services.entity.AuthorizedValuesResource;
import no.deichman.services.entity.EntityResource;
import no.deichman.services.entity.ResourceBase;
import no.deichman.services.marc.MarcResource;
import no.deichman.services.ontology.OntologyResource;
import no.deichman.services.ontology.TemplateResource;
import no.deichman.services.ontology.TranslationResource;
import no.deichman.services.restutils.CORSResponseFilter;
import no.deichman.services.search.SearchResource;
import no.deichman.services.version.VersionResource;
import org.apache.jena.system.JenaSystem;
import org.eclipse.jetty.server.Handler;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.Slf4jRequestLog;
import org.eclipse.jetty.server.handler.HandlerCollection;
import org.eclipse.jetty.server.handler.RequestLogHandler;
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
    private final int port;
    private Server jettyServer;
    private String kohaPort;
    private boolean inMemoryRDFRepository;
    private String elasticSearchUrl = System.getProperty("ELASTICSEARCH_URL", "http://sibyl:1666");
    private String z3950Endpoint;

    public App(int port, String kohaPort, boolean inMemoryRDFRepository, String z3950Endpoint) {
        this.port = port;
        this.kohaPort = kohaPort;
        this.inMemoryRDFRepository = inMemoryRDFRepository;
        this.z3950Endpoint = z3950Endpoint;
    }

    public static void main(String[] args) {
        App app = new App(SERVICES_PORT_NO, null, false, null);
        try {
            JenaSystem.init(); // Needed to counter sporadic nullpointerexceptions because of context is not initialized.
            app.startSync();
        } catch (Exception e) {
            LOG.error("App failed to startSync:");
            e.printStackTrace(System.err);
        }
    }

    private void startSync() throws Exception {
        try {
            startAsync();
            join();
        } finally {
            stop();
        }
    }

    public void startAsync() throws Exception {
        setUpMainWebApp();
    }

    private void setUpMainWebApp() throws Exception {

        jettyServer = new Server(port);
        HandlerCollection handlers = new HandlerCollection();

        ServletContextHandler context = new ServletContextHandler(ServletContextHandler.SESSIONS);
        context.setContextPath("/");
        handlers.addHandler(context);

        jettyServer.setHandler(handlers);

        ServletHolder jerseyServlet = context.addServlet(
                org.glassfish.jersey.servlet.ServletContainer.class, "/*");
        jerseyServlet.setInitOrder(0);

        if (kohaPort != null) {
            jerseyServlet.setInitParameter(
                    ResourceBase.SERVLET_INIT_PARAM_KOHA_PORT,
                    kohaPort
            );
        }

        if (inMemoryRDFRepository) {
            jerseyServlet.setInitParameter(
                    ResourceBase.SERVLET_INIT_PARAM_IN_MEMORY_RDF_REPOSITORY,
                    String.valueOf(inMemoryRDFRepository)
            );
        }

        if (elasticSearchUrl != null) {
            jerseyServlet.setInitParameter(ResourceBase.ELASTIC_SEARCH_URL, elasticSearchUrl);
        }

        if (z3950Endpoint != null) {
            jerseyServlet.setInitParameter(ResourceBase.Z3950_ENDPOINT, z3950Endpoint);
        }
        // Tells the Jersey Servlet which REST service/class to load.
        jerseyServlet.setInitParameter(ServerProperties.PROVIDER_CLASSNAMES,
                String.join(",", asList(
                        AuthorizedValuesResource.class.getCanonicalName(),
                        EntityResource.class.getCanonicalName(),
                        OntologyResource.class.getCanonicalName(),
                        SearchResource.class.getCanonicalName(),
                        MarcResource.class.getCanonicalName(),
                        CORSResponseFilter.class.getCanonicalName(),
                        VersionResource.class.getCanonicalName(),
                        TranslationResource.class.getCanonicalName(),
                        Datasource.class.getCanonicalName(),
                        ImmediateFeature.class.getCanonicalName(),
                        TemplateResource.class.getCanonicalName()
                )));


        HandlerCollection collection = new HandlerCollection();
        RequestLogHandler rlh = new RequestLogHandler();
        // Slf4j - who uses anything else?
        Slf4jRequestLog requestLog = new Slf4jRequestLog();
        requestLog.setExtended(false);
        rlh.setRequestLog(requestLog);
        collection.setHandlers(new Handler[]{context, rlh});
        jettyServer.setHandler(collection);
        jettyServer.start();
        LOG.info("App started on port: " + port);
    }

    private void join() throws InterruptedException {
        jettyServer.join();
    }

    public void stop() throws Exception {
        LOG.info("Stopping App on port: " + port);
        try {
            jettyServer.stop();
        } finally {
            jettyServer.destroy();
        }
    }

}
