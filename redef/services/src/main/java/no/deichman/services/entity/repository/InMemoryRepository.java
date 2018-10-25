package no.deichman.services.entity.repository;

import org.apache.jena.query.Dataset;
import org.apache.jena.query.DatasetFactory;
import org.apache.jena.query.Query;
import org.apache.jena.query.QueryExecution;
import org.apache.jena.query.QueryExecutionFactory;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.update.UpdateAction;
import org.apache.jena.update.UpdateRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import static no.deichman.services.entity.repository.SPARQLQueryBuilder.DEFAULT_GRAPH;

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
        model.addNamedModel(DEFAULT_GRAPH, ModelFactory.createDefaultModel());
        LOG.info("In-memory repository started.");
    }

    public void addData(Model newData){
        model.getNamedModel(DEFAULT_GRAPH).add(newData);
    }

    public Model getModel() {
        return model.getNamedModel(DEFAULT_GRAPH);
    }

    @Override
    protected QueryExecution getQueryExecution(Query query) {
        return QueryExecutionFactory.create(query, getModel());
    }

    @Override
    protected void executeUpdate(UpdateRequest updateRequest) {
        UpdateAction.execute(updateRequest, this.model);
    }
}
