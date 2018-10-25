package no.deichman.services.entity.repository;

import org.apache.jena.query.Dataset;
import org.apache.jena.query.DatasetFactory;
import org.apache.jena.query.Query;
import org.apache.jena.query.QueryExecution;
import org.apache.jena.query.QueryExecutionFactory;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.update.UpdateAction;
import org.apache.jena.update.UpdateRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Responsibility: Implement an in-memory RDF-repository.
 */
public final class InMemoryRepository extends RDFRepositoryBase {
    private final Dataset model;
    private static final Logger LOG = LoggerFactory.getLogger(InMemoryRepository.class);

    public InMemoryRepository() {
        this(new SPARQLQueryBuilder(), new UniqueURIGenerator());
    }

    private InMemoryRepository(SPARQLQueryBuilder sqb, UniqueURIGenerator uriGenerator) {
        super(sqb, uriGenerator);
        model = DatasetFactory.create();
        LOG.info("In-memory repository started.");
    }

    public void addData(Model newData){
        model.getDefaultModel().add(newData);
    }

    public Model getModel() {
        return model.getDefaultModel();
    }

    @Override
    protected QueryExecution getQueryExecution(Query query) {
        return QueryExecutionFactory.create(query, model);
    }

    @Override
    protected void executeUpdate(UpdateRequest updateRequest) {
        UpdateAction.execute(updateRequest, this.model);
    }
}
