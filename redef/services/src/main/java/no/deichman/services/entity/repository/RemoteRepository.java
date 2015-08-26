package no.deichman.services.entity.repository;

import com.hp.hpl.jena.query.Query;
import com.hp.hpl.jena.query.QueryExecution;
import com.hp.hpl.jena.query.QueryExecutionFactory;
import com.hp.hpl.jena.update.UpdateExecutionFactory;
import com.hp.hpl.jena.update.UpdateRequest;
import no.deichman.services.uridefaults.BaseURI;

/**
 * Responsibility: Remotely calling a sparql endpoint to do queries and updates.
 */
public final class RemoteRepository extends RDFRepositoryBase {

    private static final String FUSEKI_PORT = System.getProperty("FUSEKI_PORT", "http://192.168.50.50:3030");
    private final String fusekiPort;

    RemoteRepository(String fusekiPort, UniqueURIGenerator uriGenerator, SPARQLQueryBuilder sparqlQueryBuilder, BaseURI baseURI) {
        super(baseURI, sparqlQueryBuilder, uriGenerator);
        this.fusekiPort = fusekiPort;
        System.out.println("Repository started with FUSEKI_PORT: " + this.fusekiPort);
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
