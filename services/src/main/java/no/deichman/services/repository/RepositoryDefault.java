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
        QueryExecution qexec = QueryExecutionFactory.sparqlService(uri, QueryBuilder.getGetWorkByIdQuery(id));
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

    @Override
    public void createWork(final String work) {
        String uri = "http://192.168.50.50:3030/ds/update";
        UpdateRequest updateRequest = UpdateFactory.create(QueryBuilder.getCreateWorkQueryString(work));
        UpdateProcessor qexec = UpdateExecutionFactory.createRemote(updateRequest, uri);
        qexec.execute();
    }}
