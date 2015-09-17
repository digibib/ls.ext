package no.deichman.services.entity.repository;

import org.apache.jena.query.Dataset;
import org.apache.jena.query.DatasetFactory;
import org.apache.jena.query.Query;
import org.apache.jena.query.QueryExecution;
import org.apache.jena.query.QueryExecutionFactory;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.update.UpdateAction;
import org.apache.jena.update.UpdateRequest;
import no.deichman.services.uridefaults.BaseURI;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Responsibility: Implement an in-memory RDF-repository.
 */
public final class InMemoryRepository extends RDFRepositoryBase {
    private final Dataset model;
    private static final Logger LOG = LoggerFactory.getLogger(InMemoryRepository.class);

    public InMemoryRepository() {
        this(BaseURI.local());
    }

    public InMemoryRepository(BaseURI baseURI) {
        this(baseURI, new SPARQLQueryBuilder(baseURI), new UniqueURIGenerator(baseURI));
    }

    private InMemoryRepository(BaseURI baseURI, SPARQLQueryBuilder sqb, UniqueURIGenerator uriGenerator) {
        super(baseURI, sqb, uriGenerator);
        model = DatasetFactory.createMem();
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
