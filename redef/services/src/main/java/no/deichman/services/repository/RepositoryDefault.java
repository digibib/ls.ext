package no.deichman.services.repository;

import com.hp.hpl.jena.query.QueryExecution;
import com.hp.hpl.jena.query.QueryExecutionFactory;
import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;
import com.hp.hpl.jena.rdf.model.ResourceFactory;
import com.hp.hpl.jena.rdf.model.Statement;
import com.hp.hpl.jena.update.UpdateExecutionFactory;
import com.hp.hpl.jena.update.UpdateFactory;
import com.hp.hpl.jena.update.UpdateRequest;
import com.hp.hpl.jena.vocabulary.RDF;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import no.deichman.services.patch.Patch;
import no.deichman.services.uridefaults.BaseURIDefault;
import no.deichman.services.utils.UniqueURI;
import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFDataMgr;

public class RepositoryDefault implements Repository {

    private static final String FUSEKI_PORT = System.getProperty("FUSEKI_PORT", "http://192.168.50.50:3030");
    private static final String UPDATE_URI = FUSEKI_PORT + "/ds/update";
    private static final String SPARQL_URI = FUSEKI_PORT + "/ds/sparql";
    private final SPARQLQueryBuilder sqb;
    private final BaseURIDefault bud;

    public RepositoryDefault() {
        System.out.println("Repository started with FUSEKI_PORT: " + FUSEKI_PORT);
        bud = new BaseURIDefault();
        sqb = new SPARQLQueryBuilder(bud);
    }

    @Override
    public Model retrieveWorkById(final String id) {
        String uri = bud.getWorkURI() + id;
        System.out.println("Attempting to retrieve: " + uri);
        try (QueryExecution qexec = QueryExecutionFactory.sparqlService(SPARQL_URI, sqb.describeWorkAndLinkedPublication(uri))) {
            return qexec.execDescribe();
        }
    }

    @Override
    public Model retrievePublicationById(final String id) {
        String uri = bud.getPublicationURI() + id;
        System.out.println("Attempting to retrieve: " + uri);
        try (QueryExecution qexec = QueryExecutionFactory.sparqlService(SPARQL_URI, sqb.getGetResourceByIdQuery(uri))) {
            return qexec.execDescribe();
        }
    }

    @Override
    public void updateWork(final String work) {
        InputStream stream = new ByteArrayInputStream(work.getBytes(StandardCharsets.UTF_8));
        Model model = ModelFactory.createDefaultModel();
         RDFDataMgr.read(model, stream, Lang.JSONLD);
         
        UpdateRequest updateRequest = UpdateFactory.create(sqb.getUpdateWorkQueryString(model));
        UpdateExecutionFactory.createRemote(updateRequest, UPDATE_URI).execute();
    }

    @Override
    public boolean askIfResourceExists(String uri) {
        try (QueryExecution qexec = QueryExecutionFactory.sparqlService(SPARQL_URI, sqb.checkIfResourceExists(uri))){
            return qexec.execAsk();
        }
    }

    @Override
    public boolean askIfResourceExistsInGraph(String uri, String graph) {
        try (QueryExecution qexec = QueryExecutionFactory.sparqlService(SPARQL_URI, sqb.checkIfResourceExistsInGraph(uri, graph))){
            return qexec.execAsk();
        }
    }

    @Override
    public String createWork(String work) {
        InputStream stream = new ByteArrayInputStream(work.getBytes(StandardCharsets.UTF_8));
        UniqueURI uri = new UniqueURI();
        String id = uri.getNewURI("work", this, new BaseURIDefault());
        Model tempModel = ModelFactory.createDefaultModel();
        Statement workResource = ResourceFactory.createStatement(
                ResourceFactory.createResource(uri.toString()),
                RDF.type,
                ResourceFactory.createResource(bud.getOntologyURI() + "Work"));
        tempModel.add(workResource);
        RDFDataMgr.read(tempModel, stream, Lang.JSONLD);

        UpdateRequest updateRequest = UpdateFactory.create(sqb.getCreateQueryString(id, tempModel));
        UpdateExecutionFactory.createRemote(updateRequest, UPDATE_URI).execute();
        return id;
    }

    @Override
    public String createPublication(String publication) {
        InputStream stream = new ByteArrayInputStream(publication.getBytes(StandardCharsets.UTF_8));
        UniqueURI uri = new UniqueURI();
        String id = uri.getNewURI("publication", this, new BaseURIDefault());
        Model tempModel = ModelFactory.createDefaultModel();
        Statement publicationResource = ResourceFactory.createStatement(
                ResourceFactory.createResource(uri.toString()),
                RDF.type,
                ResourceFactory.createResource(bud.getOntologyURI() + "Publication"));
        tempModel.add(publicationResource);
        RDFDataMgr.read(tempModel, stream, Lang.JSONLD);

        UpdateRequest updateRequest = UpdateFactory.create(sqb.getCreateQueryString(id, tempModel));
        UpdateExecutionFactory.createRemote(updateRequest, UPDATE_URI).execute();
        return id;
    }

    @Override
    public boolean askIfStatementExists(Statement statement) {
        try (QueryExecution qexec = QueryExecutionFactory.sparqlService(SPARQL_URI, sqb.checkIfStatementExists(statement))){
            return qexec.execAsk();
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public boolean askIfStatementExistsInGraph(Statement statement, String graph) {
        try (QueryExecution qexec = QueryExecutionFactory.sparqlService(SPARQL_URI, sqb.checkIfStatementExistsInGraph(statement, graph))){
            return qexec.execAsk();
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public void update(Model inputModel) {
        UpdateRequest updateRequest = UpdateFactory.create(sqb.updateAdd(inputModel));
        UpdateExecutionFactory.createRemote(updateRequest, UPDATE_URI).execute();
    }

    @Override
    public void updateNamedGraph(Model inputModel, String graph) {
        UpdateRequest updateRequest = UpdateFactory.create(sqb.updateAddToGraph(inputModel, graph));
        UpdateExecutionFactory.createRemote(updateRequest, UPDATE_URI).execute();
    }

    @Override
    public void delete(Model inputModel) {
        UpdateRequest updateRequest = UpdateFactory.create(sqb.updateDelete(inputModel));
        UpdateExecutionFactory.createRemote(updateRequest, UPDATE_URI).execute();
    }

    @Override
    public void deleteFromNamedGraph(Model inputModel, String graph) {
        UpdateRequest updateRequest = UpdateFactory.create(sqb.updateDeleteFromGraph(inputModel, graph));
        UpdateExecutionFactory.createRemote(updateRequest, UPDATE_URI).execute();
    }

    @Override
    public void dump() {
        try (QueryExecution qexec = QueryExecutionFactory.sparqlService(SPARQL_URI, sqb.dumpModel())){
            System.out.println(qexec.execDescribe());
        }
    }

    @Override
    public boolean askIfGraphExists(String graph) {
        try (QueryExecution qexec = QueryExecutionFactory.sparqlService(SPARQL_URI, sqb.askIfGraphExists(graph))){
            return qexec.execAsk();
        }
    }

    @Override
    public void patch(List<Patch> patches) {
        UpdateRequest updateRequest = UpdateFactory.create(sqb.patch(patches));
        UpdateExecutionFactory.createRemote(updateRequest, UPDATE_URI).execute();
    }
}
