package no.deichman.services;

import no.deichman.services.rest.AuthorizedValuesResource;
import no.deichman.services.rest.OntologyResource;
import no.deichman.services.rest.PublicationResource;
import no.deichman.services.rest.ResourceBase;
import no.deichman.services.rest.WorkResource;
import no.deichman.services.rest.utils.CORSResponseFilter;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.servlet.ServletContextHandler;
import org.eclipse.jetty.servlet.ServletHolder;
import org.glassfish.jersey.server.ServerProperties;

import static java.util.Arrays.asList;

/**
 * Responsibility: Start application (using embedded web server).
 */
public final class App {

    private static final int SERVICES_PORT_NO = 8005;
    private Server jettyServer;
    private final int port;
    private String kohaPort;
    private boolean inMemoryRDFRepository;

    App(int port, String kohaPort, boolean inMemoryRDFRepository) {
        this.port = port;
        this.kohaPort = kohaPort;
        this.inMemoryRDFRepository = inMemoryRDFRepository;
    }

    void startSync() throws Exception {
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

        // Tells the Jersey Servlet which REST service/class to load.
        jerseyServlet.setInitParameter(ServerProperties.PROVIDER_CLASSNAMES,
                String.join(",", asList(
                        WorkResource.class.getCanonicalName(),
                        OntologyResource.class.getCanonicalName(),
                        PublicationResource.class.getCanonicalName(),
                        AuthorizedValuesResource.class.getCanonicalName(),
                        CORSResponseFilter.class.getCanonicalName()
                )));

        jettyServer.start();
        System.out.println("App started on port: " + port);
    }

    private void join() throws InterruptedException {
        jettyServer.join();
    }

    void stop() throws Exception {
        System.out.println("Stopping App on port: " + port);
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
            System.err.println("App failed to startSync:");
            e.printStackTrace(System.err);
        }
    }
}
