/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package no.deichman.services.repository;

import com.hp.hpl.jena.query.Query;
import com.hp.hpl.jena.query.QueryExecution;
import com.hp.hpl.jena.query.QueryExecutionFactory;
import com.hp.hpl.jena.query.QueryFactory;
import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;

/**
 *
 * @author sbd
 */
public class RepositoryInMemory implements Repository {

    private Model model;
    
    public RepositoryInMemory() {
    model = ModelFactory.createDefaultModel();
    model.read("testdata.ttl", "TURTLE");
    }
    
    @Override
    public Model retrieveWorkById(String id) {
        String queryString = "PREFIX deichman: <http://deichman.no/ontology#>\n"
                + "PREFIX dcterms: <http://purl.org/dc/terms/>\n"
                + "DESCRIBE ?s\n"
                + "WHERE\n"
                + "{\n"
                + " ?s a deichman:Work ;"
                + " dcterms:identifier \"" + id + "\" ;"
                + "}";
        Query query = QueryFactory.create(queryString);
        QueryExecution qexec = QueryExecutionFactory.create(query, model);
        Model resultModel = qexec.execDescribe();
        qexec.close();
        return resultModel;
    }
    
}
