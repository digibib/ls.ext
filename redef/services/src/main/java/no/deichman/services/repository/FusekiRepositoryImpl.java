package no.deichman.services.repository;

import com.hp.hpl.jena.query.Query;
import com.hp.hpl.jena.query.QueryExecution;
import com.hp.hpl.jena.query.QueryExecutionFactory;
import com.hp.hpl.jena.update.UpdateExecutionFactory;
import com.hp.hpl.jena.update.UpdateRequest;
import no.deichman.services.uridefaults.BaseURI;
import no.deichman.services.uridefaults.BaseURIDefault;

/**
 * Responsibility: Remotely calling a sparql endpoint to do queries and updates.
 */
public final class FusekiRepositoryImpl extends FusekiRepository {

    private static final String FUSEKI_PORT = System.getProperty("FUSEKI_PORT", "http://192.168.50.50:3030");
    private final String fusekiPort;

    public FusekiRepositoryImpl() {
        this(FUSEKI_PORT,
                new UniqueURIGenerator(new BaseURIDefault()),
                new SPARQLQueryBuilder(new BaseURIDefault()),
                new BaseURIDefault());
    }

    FusekiRepositoryImpl(String fusekiPort, UniqueURIGenerator uriGenerator, SPARQLQueryBuilder sparqlQueryBuilder, BaseURI baseURI) {
        super(baseURI, sparqlQueryBuilder, uriGenerator);
        this.fusekiPort = fusekiPort;
        System.out.println("Repository started with FUSEKI_PORT: " + fusekiPort);
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
