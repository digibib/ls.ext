package no.deichman.services.repository;

import com.hp.hpl.jena.query.Query;
import com.hp.hpl.jena.query.QueryExecution;
import com.hp.hpl.jena.query.QueryExecutionFactory;
import com.hp.hpl.jena.query.QueryFactory;
import com.hp.hpl.jena.rdf.model.Model;

public class RepositoryDefault implements Repository {

    @Override
    public Model retrieveWorkById(String id) {
        String uri = "http://192.168.50.50:3030/ds/sparql";
        String queryString = "PREFIX deichman: <http://deichman.no/ontology#>\n"
                + "PREFIX dcterms: <http://purl.org/dc/terms/>\n"
                + "DESCRIBE ?s\n"
                + "WHERE\n"
                + "{\n"
                + " ?s a deichman:Work ;"
                + " dcterms:identifier \"" + id + "\" ;"
                + "}";
        Query query = QueryFactory.create(queryString);
        QueryExecution qexec = QueryExecutionFactory.sparqlService(uri, query);
        Model resultModel = qexec.execDescribe();
        qexec.close();

        return resultModel;
    }

    @Override
    public Model listWork() {
        String uri = "http://192.168.50.50:3030/ds/sparql";
        String queryString = "PREFIX deichman: <http://deichman.no/ontology#>\n"
                + "describe ?s where\n"
                + " {\n"
                + " ?s a deichman:Work"
                + "}";
        Query query = QueryFactory.create(queryString);
        QueryExecution qexec = QueryExecutionFactory.sparqlService(uri, query);
        Model resultModel = qexec.execDescribe();
        qexec.close();

        return resultModel;
    }
}
