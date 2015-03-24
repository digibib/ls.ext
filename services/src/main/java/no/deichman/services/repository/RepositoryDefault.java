package no.deichman.services.repository;

import com.hp.hpl.jena.query.QueryExecution;
import com.hp.hpl.jena.query.QueryExecutionFactory;
import com.hp.hpl.jena.rdf.model.Model;

public class RepositoryDefault implements Repository {

    @Override
    public Model retrieveWorkById(String id) {
        String uri = "http://192.168.50.50:3030/ds/sparql";
        QueryExecution qexec = QueryExecutionFactory.sparqlService(uri, QueryBuilder.createQuery(id));
        Model resultModel = qexec.execConstruct();
        qexec.close();

        return resultModel;
    }

    @Override
    public Model listWork() {
        String uri = "http://192.168.50.50:3030/ds/sparql";
        QueryExecution qexec = QueryExecutionFactory.sparqlService(uri, QueryBuilder.getListWorkQuery());
        Model resultModel = qexec.execDescribe();
        qexec.close();

        return resultModel;
    }
}
