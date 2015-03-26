package no.deichman.services.repository;

import com.hp.hpl.jena.query.QueryExecution;
import com.hp.hpl.jena.query.QueryExecutionFactory;
import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.update.UpdateExecutionFactory;
import com.hp.hpl.jena.update.UpdateFactory;
import com.hp.hpl.jena.update.UpdateProcessor;
import com.hp.hpl.jena.update.UpdateRequest;

public class RepositoryDefault implements Repository {

    @Override
    public Model retrieveWorkById(final String id) {
        String uri = "http://192.168.50.50:3030/ds/sparql";
        try (QueryExecution qexec = QueryExecutionFactory.sparqlService(uri, QueryBuilder.getGetWorkByIdQuery(id))) {
            return qexec.execConstruct();
        }
    }

    @Override
    public Model listWork() {
        String uri = "http://192.168.50.50:3030/ds/sparql";
        try(QueryExecution qexec = QueryExecutionFactory.sparqlService(uri, QueryBuilder.getListWorkQuery())) {
            return qexec.execDescribe();
        }
    }

    @Override
    public void createWork(final String work) {
        String uri = "http://192.168.50.50:3030/ds/update";
        UpdateRequest updateRequest = UpdateFactory.create(QueryBuilder.getCreateWorkQueryString(work));
        UpdateExecutionFactory.createRemote(updateRequest, uri).execute();
    }}
