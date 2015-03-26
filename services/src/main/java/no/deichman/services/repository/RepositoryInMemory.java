package no.deichman.services.repository;

import com.hp.hpl.jena.query.QueryExecution;
import com.hp.hpl.jena.query.QueryExecutionFactory;
import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;
import com.hp.hpl.jena.update.UpdateAction;
import com.hp.hpl.jena.update.UpdateFactory;
import com.hp.hpl.jena.update.UpdateRequest;

public class RepositoryInMemory implements Repository {

    private Model model;
    
    public RepositoryInMemory() {
        model = ModelFactory.createDefaultModel();
        model.read("testdata.ttl", "TURTLE");
    }
    
    @Override
    public Model retrieveWorkById(String id) {
        try (QueryExecution qexec = QueryExecutionFactory.create(QueryBuilder.getGetWorkByIdQuery(id), model)) {
            return qexec.execConstruct();
        }
    }

    @Override
    public Model listWork() {
        try (QueryExecution qexec = QueryExecutionFactory.create(QueryBuilder.getListWorkQuery(), model)) {
            return qexec.execDescribe();
        }
    }

    @Override
    public void createWork(String work) {
        UpdateRequest updateRequest = UpdateFactory.create(QueryBuilder.getCreateWorkQueryString(work));
        UpdateAction.execute(updateRequest, model);
    }   
}
