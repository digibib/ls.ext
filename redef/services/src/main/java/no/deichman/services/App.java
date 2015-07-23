package no.deichman.services;

import no.deichman.services.resources.OntologyResource;
import no.deichman.services.resources.PublicationResource;
import no.deichman.services.resources.WorkResource;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.servlet.ServletContextHandler;
import org.eclipse.jetty.servlet.ServletHolder;

import static java.util.Arrays.asList;

/**
 * Responsibility: Start application (using embedded web server).
 */
public final class App {

    private static final int SERVICES_PORT_NO = 8080;

    private App() { } // Not instantiable

    public static void main(String[] args) throws Exception {
        ServletContextHandler context = new ServletContextHandler(ServletContextHandler.SESSIONS);
        context.setContextPath("/");

        Server jettyServer = new Server(SERVICES_PORT_NO);
        jettyServer.setHandler(context);

        ServletHolder jerseyServlet = context.addServlet(
                org.glassfish.jersey.servlet.ServletContainer.class, "/*");
        jerseyServlet.setInitOrder(0);

        // Tells the Jersey Servlet which REST service/class to load.
        jerseyServlet.setInitParameter("jersey.config.server.provider.classnames",
                String.join(",", asList(
                    WorkResource.class.getCanonicalName(),
                    OntologyResource.class.getCanonicalName(),
                    PublicationResource.class.getCanonicalName()
                )));

        try {
            jettyServer.start();
            jettyServer.join();
        } finally {
            jettyServer.destroy();
        }
    }
}
