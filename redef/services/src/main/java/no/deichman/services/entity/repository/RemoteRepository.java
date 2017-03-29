package no.deichman.services.entity.repository;

import org.apache.http.client.HttpClient;
import org.apache.http.impl.client.SystemDefaultHttpClient;
import org.apache.jena.query.Query;
import org.apache.jena.query.QueryExecution;
import org.apache.jena.query.QueryExecutionFactory;
import org.apache.jena.riot.WebContent;
import org.apache.jena.riot.web.HttpOp;
import org.apache.jena.sparql.modify.UpdateProcessRemote;
import org.apache.jena.update.UpdateRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Responsibility: Remotely calling a sparql endpoint to do queries and updates.
 */
public final class RemoteRepository extends RDFRepositoryBase {
    private static final Logger LOG = LoggerFactory.getLogger(RemoteRepository.class);
    private static HttpClient httpClient = new SystemDefaultHttpClient();
    private static final String TRIPLESTORE_PORT = "http://fuseki:3030";
    private final String triplestorePort;

    RemoteRepository(String triplestorePort, UniqueURIGenerator uriGenerator, SPARQLQueryBuilder sparqlQueryBuilder) {
        super(sparqlQueryBuilder, uriGenerator);
        this.triplestorePort = triplestorePort;
        LOG.info("Repository started with TRIPLESTORE_PORT: " + this.triplestorePort);
        HttpOp.setDefaultHttpClient(httpClient);
    }

    public RemoteRepository() {
        this(TRIPLESTORE_PORT,
                new UniqueURIGenerator(),
                new SPARQLQueryBuilder());
    }

    @Override
    protected QueryExecution getQueryExecution(Query query) {
        return QueryExecutionFactory.sparqlService(triplestorePort + "/ds/sparql", query);
    }

    @Override
    protected void executeUpdate(UpdateRequest updateRequest) {
        UpdateProcessRemote updateProcessRemote = new UpdateProcessRemote(updateRequest, triplestorePort + "/ds/update", null){
            @Override
            public void execute() {
                // Build endpoint URL
                String endpoint = this.getEndpoint();
                String querystring = this.getQueryString();
                if (querystring != null && !querystring.equals("")) {
                    endpoint = endpoint.contains("?") ? endpoint + "&" + querystring : endpoint + "?" + querystring;
                }

                // Execution
                String reqStr = this.getUpdateRequest().toString();
                HttpOp.execHttpPost(endpoint, WebContent.contentTypeSPARQLUpdate, reqStr, httpClient, getHttpContext());
            }
        };
        updateProcessRemote.execute();
    }

}
