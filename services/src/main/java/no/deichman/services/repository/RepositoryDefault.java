package no.deichman.services.repository;



import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFDataMgr;

import com.hp.hpl.jena.query.QueryExecution;
import com.hp.hpl.jena.query.QueryExecutionFactory;
import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;
import com.hp.hpl.jena.update.UpdateExecutionFactory;
import com.hp.hpl.jena.update.UpdateFactory;
import com.hp.hpl.jena.update.UpdateRequest;

import no.deichman.services.SPARQLQueryBuilder;

public class RepositoryDefault implements Repository {

    private static final String FUSEKI_PORT = System.getProperty("FUSEKI_PORT", "http://192.168.50.50:3030");
    private static final String UPDATE_URI = FUSEKI_PORT + "/ds/update";
    private static final String SPARQL_URI = FUSEKI_PORT + "/ds/sparql";

    public RepositoryDefault() {
        System.out.println("Repository started with FUSEKI_PORT: " + FUSEKI_PORT);
    }

    @Override
    public Model retrieveWorkById(final String id) {
        try (QueryExecution qexec = QueryExecutionFactory.sparqlService(SPARQL_URI, SPARQLQueryBuilder.getGetWorkByIdQuery(id))) {
            return qexec.execConstruct();
        }
    }

    @Override
    public Model listWork() {
        try(QueryExecution qexec = QueryExecutionFactory.sparqlService(SPARQL_URI, SPARQLQueryBuilder.getListWorkQuery())) {
            return qexec.execDescribe();
        }
    }

    @Override
    public void createWork(final String work) {
    	InputStream stream = new ByteArrayInputStream(work.getBytes(StandardCharsets.UTF_8));
    	Model model = ModelFactory.createDefaultModel();
     	RDFDataMgr.read(model, stream, Lang.JSONLD);
     	
        UpdateRequest updateRequest = UpdateFactory.create(SPARQLQueryBuilder.getCreateWorkQueryString(model));
        UpdateExecutionFactory.createRemote(updateRequest, UPDATE_URI).execute();
    }}
