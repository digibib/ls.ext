package no.deichman.services.entity.repository;

import org.apache.jena.query.Query;
import org.apache.jena.query.QueryExecution;
import org.apache.jena.query.QueryExecutionFactory;
import org.apache.jena.update.UpdateExecutionFactory;
import org.apache.jena.update.UpdateRequest;
import no.deichman.services.uridefaults.BaseURI;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Responsibility: Remotely calling a sparql endpoint to do queries and updates.
 */
public final class RemoteRepository extends RDFRepositoryBase {
    private final Logger log = LoggerFactory.getLogger(this.getClass());

    private static final String FUSEKI_PORT = System.getProperty("FUSEKI_PORT", "http://192.168.50.50:3030");
    private final String fusekiPort;

    RemoteRepository(String fusekiPort, UniqueURIGenerator uriGenerator, SPARQLQueryBuilder sparqlQueryBuilder, BaseURI baseURI) {
        super(baseURI, sparqlQueryBuilder, uriGenerator);
        this.fusekiPort = fusekiPort;
        log.info("Repository started with FUSEKI_PORT: " + this.fusekiPort);
    }

    public RemoteRepository() {
        this(FUSEKI_PORT,
                new UniqueURIGenerator(BaseURI.remote()),
                new SPARQLQueryBuilder(BaseURI.remote()),
                BaseURI.remote());
    }

    @Override
    protected QueryExecution getQueryExecution(Query query) {
        return QueryExecutionFactory.sparqlService(fusekiPort + "/ds/sparql", query);
    }

    @Override
    protected void executeUpdate(UpdateRequest updateRequest) {
        UpdateExecutionFactory.createRemote(updateRequest, fusekiPort + "/ds/update").execute();
    }
}
