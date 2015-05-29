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
import com.hp.hpl.jena.rdf.model.ResourceFactory;
import com.hp.hpl.jena.rdf.model.Statement;
import com.hp.hpl.jena.update.UpdateAction;
import com.hp.hpl.jena.update.UpdateFactory;
import com.hp.hpl.jena.update.UpdateRequest;
import com.hp.hpl.jena.vocabulary.RDF;

import no.deichman.services.SPARQLQueryBuilder;
import no.deichman.services.uridefaults.BaseURIDefault;
import no.deichman.services.uridefaults.BaseURIMock;
import no.deichman.services.utils.UniqueURI;
import no.deichman.services.utils.UniqueURIMock;

public class RepositoryInMemory implements Repository {

    private final Model model;
    
    public RepositoryInMemory() {
        model = ModelFactory.createDefaultModel();
        model.read("testdata.ttl", "TURTLE");
    }
    
    @Override
    public Model retrieveWorkById(String id) {
        String uri = BaseURIMock.getWorkURI() + id;
        try (QueryExecution qexec = QueryExecutionFactory.create(SPARQLQueryBuilder.getGetWorkByIdQuery(uri), model)) {
            return qexec.execDescribe();
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
	public String createWork(String work) {
        InputStream stream = new ByteArrayInputStream(work.getBytes(StandardCharsets.UTF_8));
        UniqueURI random = new UniqueURIMock();
		String id = random.getNewURI("work", this);
        Model tempModel = ModelFactory.createDefaultModel();
        Statement workResource = ResourceFactory.createStatement(
                ResourceFactory.createResource(random.toString()),
                RDF.type,
                ResourceFactory.createResource(BaseURIDefault.getOntologyURI() + "Work"));
        tempModel.add(workResource);
        RDFDataMgr.read(tempModel, stream, Lang.JSONLD);

        UpdateRequest updateRequest = UpdateFactory.create(SPARQLQueryBuilder.getCreateWorkQueryString(id, tempModel));
        UpdateAction.execute(updateRequest, model);

		return id;
	}
}
