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
               + "PREFIX deichman: <http://deichman.no/ontology#>\n"
               + "PREFIX foaf: <http://xmlns.com/foaf/0.1/>\n"
               + "CONSTRUCT {\n"
               + "?url a deichman:Work ;\n"
               + "     dcterms:identifier ?id ;\n"
               + "     dcterms:creator ?creator ;\n"
               + "     dcterms:date ?date ;\n"
               + "     dcterms:title ?title ;\n"
               + "     deichman:hasEditions ?edition .\n"
               + "} WHERE {\n"
               + "?url a deichman:Work ;\n"
               + "     dcterms:identifier \"" + id + "\" .\n"
               + "OPTIONAL {?url dcterms:creator ?c}\n"
               + "OPTIONAL {?url dcterms:title ?t}\n"
               + "OPTIONAL {?url dcterms:date ?d}\n"
               + "OPTIONAL {?url deichman:hasEditions ?edition}\n"
               + "?c foaf:name ?creator .\n"
               + "BIND (str(?d) as ?date)\n"
               + "BIND (str(?t) as ?title)\n"
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
