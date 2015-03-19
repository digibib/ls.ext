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
public class RepositoryDefault implements Repository{

    
    @Override
    public Model retrieveWorkById(String id) {
        Model model = ModelFactory.createDefaultModel();
        String uri = "http://192.168.50.50:3030/sparql";
        String queryString = "DESCRIBE <" + uri + ">";
        Query query = QueryFactory.create(queryString);
        QueryExecution qexec = QueryExecutionFactory.create(query, model);
        Model resultModel = qexec.execDescribe();
        qexec.close();

        return resultModel;
    }
}
