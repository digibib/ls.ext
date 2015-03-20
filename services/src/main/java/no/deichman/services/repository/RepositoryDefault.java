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
        String queryString = "PREFIX dcterms: <http://purl.org/dc/terms/>\n"
                + "describe * where {$a dcterms:identifier 'work_00001'}";
        Query query = QueryFactory.create(queryString);
        QueryExecution qexec = QueryExecutionFactory.sparqlService(uri, query);
        Model resultModel = qexec.execDescribe();
        qexec.close();

        return resultModel;
    }
}
