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
import com.hp.hpl.jena.update.UpdateExecutionFactory;
import com.hp.hpl.jena.update.UpdateFactory;
import com.hp.hpl.jena.update.UpdateRequest;

import no.deichman.services.SPARQLQueryBuilder;
import no.deichman.services.utils.RandomString;
import no.deichman.services.utils.RandomStringDefault;

public class RepositoryInMemory implements Repository {

    private final Model model;
    
    public RepositoryInMemory() {
        model = ModelFactory.createDefaultModel();
        model.read("testdata.ttl", "TURTLE");
    }
    
    @Override
    public Model retrieveWorkById(String id) {
        try (QueryExecution qexec = QueryExecutionFactory.create(SPARQLQueryBuilder.getGetWorkByIdQuery(id), model)) {
            return qexec.execConstruct();
        }
    }

    @Override
    public Model listWork() {
        try (QueryExecution qexec = QueryExecutionFactory.create(SPARQLQueryBuilder.getListWorkQuery(), model)) {
            return qexec.execDescribe();
        }
    }

    @Override
    public void updateWork(String work) {
        InputStream stream = new ByteArrayInputStream(work.getBytes(StandardCharsets.UTF_8));
        Model tempModel = ModelFactory.createDefaultModel();
        RDFDataMgr.read(tempModel, stream, Lang.JSONLD);

        UpdateRequest updateRequest = UpdateFactory.create(SPARQLQueryBuilder.getUpdateWorkQueryString(tempModel));
        UpdateAction.execute(updateRequest, model);
    }

	@Override
	public boolean askIfResourceExists(String uri) {
        try (QueryExecution qexec = QueryExecutionFactory.create(SPARQLQueryBuilder.checkIfResourceExists(uri), model)) {
            return qexec.execAsk();
        }
	}

	@Override
	public String createWork() {
		RandomString random = new RandomStringDefault();
		String id = random.getNewURI("work", this);
        UpdateRequest updateRequest = UpdateFactory.create(SPARQLQueryBuilder.getCreateWorkQueryString(id));
        UpdateAction.execute(updateRequest, model);
		return id;
	}
}
