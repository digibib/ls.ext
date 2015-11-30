package no.deichman.services.entity.repository;

import no.deichman.services.uridefaults.BaseURI;
import org.apache.jena.query.Query;
import org.apache.jena.query.QueryExecution;
import org.apache.jena.query.QueryExecutionFactory;
import org.apache.jena.update.UpdateExecutionFactory;
import org.apache.jena.update.UpdateRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Responsibility: Remotely calling a sparql endpoint to do queries and updates.
 */
public final class RemoteRepository extends RDFRepositoryBase {
    private static final Logger LOG = LoggerFactory.getLogger(RemoteRepository.class);

    private static final String TRIPLESTORE_PORT = System.getProperty("TRIPLESTORE_PORT", "http://192.168.50.12:3030");
    private final String triplestorePort;

    RemoteRepository(String triplestorePort, UniqueURIGenerator uriGenerator, SPARQLQueryBuilder sparqlQueryBuilder, BaseURI baseURI) {
        super(baseURI, sparqlQueryBuilder, uriGenerator);
        this.triplestorePort = triplestorePort;
        LOG.info("Repository started with TRIPLESTORE_PORT: " + this.triplestorePort);
    }

    public RemoteRepository() {
        this(TRIPLESTORE_PORT,
                new UniqueURIGenerator(BaseURI.remote()),
                new SPARQLQueryBuilder(BaseURI.remote()),
                BaseURI.remote());
    }

    @Override
    protected QueryExecution getQueryExecution(Query query) {
        return QueryExecutionFactory.sparqlService(triplestorePort + "/ds/sparql", query);
    }

    @Override
    protected void executeUpdate(UpdateRequest updateRequest) {
        UpdateExecutionFactory.createRemote(updateRequest, triplestorePort + "/ds/update").execute();
    }
}
