package no.deichman.services.repository;

import com.hp.hpl.jena.query.QueryExecution;
import com.hp.hpl.jena.query.QueryExecutionFactory;
import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;

public class RepositoryInMemory implements Repository {

    private Model model;
    
    public RepositoryInMemory() {
    model = ModelFactory.createDefaultModel();
    model.read("testdata.ttl", "TURTLE");
    }
    
    @Override
    public Model retrieveWorkById(String id) {
        QueryExecution qexec = QueryExecutionFactory.create(QueryBuilder.createQuery(id), model);
        Model resultModel = qexec.execConstruct();
        qexec.close();
        return resultModel;
    }

    @Override
    public Model listWork() {
        QueryExecution qexec = QueryExecutionFactory.create(QueryBuilder.getListWorkQuery(), model);
        Model resultModel = qexec.execDescribe();
        qexec.close();
        return resultModel;
    }
    
}
