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
import com.hp.hpl.jena.update.UpdateAction;
import com.hp.hpl.jena.update.UpdateFactory;
import com.hp.hpl.jena.update.UpdateRequest;

public class RepositoryInMemory implements Repository {

    private final Model model;
    
    public RepositoryInMemory() {
        model = ModelFactory.createDefaultModel();
        model.read("testdata.ttl", "TURTLE");
    }
    
    @Override
    public Model retrieveWorkById(String id) {
        try (QueryExecution qexec = QueryExecutionFactory.create(QueryBuilder.getGetWorkByIdQuery(id), model)) {
            return qexec.execConstruct();
        }
    }

    @Override
    public Model listWork() {
        try (QueryExecution qexec = QueryExecutionFactory.create(QueryBuilder.getListWorkQuery(), model)) {
            return qexec.execDescribe();
        }
    }

    @Override
    public void createWork(String work) {
        InputStream stream = new ByteArrayInputStream(work.getBytes(StandardCharsets.UTF_8));
        Model tempModel = ModelFactory.createDefaultModel();
        RDFDataMgr.read(tempModel, stream, Lang.JSONLD);

        UpdateRequest updateRequest = UpdateFactory.create(QueryBuilder.getCreateWorkQueryString(tempModel));
        UpdateAction.execute(updateRequest, model);
    }   
}
