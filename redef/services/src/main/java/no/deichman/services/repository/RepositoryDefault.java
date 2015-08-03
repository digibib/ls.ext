package no.deichman.services.repository;

import com.hp.hpl.jena.datatypes.xsd.XSDDatatype;
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

import javax.xml.xpath.XPathExpressionException;

import no.deichman.services.kohaadapter.KohaAdapter;
import no.deichman.services.kohaadapter.KohaAdapterImpl;
import no.deichman.services.patch.Patch;
import no.deichman.services.uridefaults.BaseURIDefault;
import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFDataMgr;

/**
 * Responsibility: TODO.
 */
public final class RepositoryDefault implements Repository {

    private static final String FUSEKI_PORT = System.getProperty("FUSEKI_PORT", "http://192.168.50.50:3030");
    private static final String UPDATE_URI = FUSEKI_PORT + "/ds/update";
    private static final String SPARQL_URI = FUSEKI_PORT + "/ds/sparql";
    private final SPARQLQueryBuilder sqb;
    private final BaseURIDefault bud;
    private final UniqueURIGenerator uriGenerator;
    private final KohaAdapter kohaAdapter;

    public RepositoryDefault() {
        System.out.println("Repository started with FUSEKI_PORT: " + FUSEKI_PORT);
        bud = new BaseURIDefault();
        sqb = new SPARQLQueryBuilder(bud);
        uriGenerator = new UniqueURIGenerator(this, new BaseURIDefault());
        kohaAdapter = new KohaAdapterImpl();
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
    public String createWork(String work) {
        InputStream stream = new ByteArrayInputStream(work.getBytes(StandardCharsets.UTF_8));
        String id = uriGenerator.getNewURI("work");
        Model tempModel = ModelFactory.createDefaultModel();
        Statement workResource = ResourceFactory.createStatement(
                ResourceFactory.createResource(uriGenerator.toString()),
                RDF.type,
                ResourceFactory.createResource(bud.getOntologyURI() + "Work"));
        tempModel.add(workResource);
        RDFDataMgr.read(tempModel, stream, Lang.JSONLD);

        UpdateRequest updateRequest = UpdateFactory.create(sqb.getCreateQueryString(id, tempModel));
        UpdateExecutionFactory.createRemote(updateRequest, UPDATE_URI).execute();
        return id;
    }

    @Override
    public String createPublication(String publication) throws XPathExpressionException, Exception {
        String recordID = kohaAdapter.getNewBiblio();
        InputStream stream = new ByteArrayInputStream(publication.getBytes(StandardCharsets.UTF_8));
        String id = uriGenerator.getNewURI("publication");
        Model tempModel = ModelFactory.createDefaultModel();
        Statement publicationResource = ResourceFactory.createStatement(
                ResourceFactory.createResource(id),
                RDF.type,
                ResourceFactory.createResource(bud.getOntologyURI() + "Publication"));
        Statement recordLink = ResourceFactory.createStatement(
                ResourceFactory.createResource(id),
                ResourceFactory.createProperty(bud.getOntologyURI() + "recordID"),
                ResourceFactory.createTypedLiteral(recordID, XSDDatatype.XSDstring));
        tempModel.add(publicationResource);
        tempModel.add(recordLink);
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
    public void delete(Model inputModel) {
        UpdateRequest updateRequest = UpdateFactory.create(sqb.updateDelete(inputModel));
        UpdateExecutionFactory.createRemote(updateRequest, UPDATE_URI).execute();
    }

    @Override
    public void patch(List<Patch> patches) {
        UpdateRequest updateRequest = UpdateFactory.create(sqb.patch(patches));
        UpdateExecutionFactory.createRemote(updateRequest, UPDATE_URI).execute();
    }
}
