package no.deichman.services.repository;

import com.hp.hpl.jena.datatypes.xsd.XSDDatatype;
import com.hp.hpl.jena.query.QueryExecution;
import com.hp.hpl.jena.query.QueryExecutionFactory;
import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;
import com.hp.hpl.jena.rdf.model.Resource;
import com.hp.hpl.jena.rdf.model.ResourceFactory;
import com.hp.hpl.jena.rdf.model.Statement;
import com.hp.hpl.jena.update.UpdateAction;
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
import no.deichman.services.uridefaults.BaseURI;
import no.deichman.services.uridefaults.BaseURIDefault;
import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFDataMgr;

/**
 * Responsibility: TODO.
 */
public final class FusekiRepository implements Repository {

    private static final String FUSEKI_PORT = System.getProperty("FUSEKI_PORT", "http://192.168.50.50:3030");
    private static final Resource PLACEHOLDER_RESOURCE = ResourceFactory.createResource("#");
    private final SPARQLQueryBuilder sqb;
    private final BaseURI baseURI;
    private final UniqueURIGenerator uriGenerator;
    private final KohaAdapter kohaAdapter;
    private final String fusekiPort;

    public FusekiRepository() {
        this(FUSEKI_PORT,
                new UniqueURIGenerator(new BaseURIDefault()),
                new SPARQLQueryBuilder(new BaseURIDefault()),
                new KohaAdapterImpl(),
                new BaseURIDefault());
    }

    FusekiRepository(String fusekiPort, UniqueURIGenerator uriGenerator, SPARQLQueryBuilder sparqlQueryBuilder, KohaAdapter kohaAdapter, BaseURI baseURI) {
        this.fusekiPort = fusekiPort;
        this.uriGenerator = uriGenerator;
        sqb = sparqlQueryBuilder;
        this.kohaAdapter = kohaAdapter;
        this.baseURI = baseURI;
        System.out.println("Repository started with FUSEKI_PORT: " + fusekiPort);
    }

    private String updateUri() {
        return fusekiPort + "/ds/update";
    }

    private String sparqlUri() {
        return fusekiPort + "/ds/sparql";
    }

    @Override
    public Model retrieveWorkById(final String id) {
        String uri = baseURI.getWorkURI() + id;
        System.out.println("Attempting to retrieve: " + uri);
        try (QueryExecution qexec = QueryExecutionFactory.sparqlService(sparqlUri(), sqb.describeWorkAndLinkedPublication(uri))) {
            return qexec.execDescribe();
        }
    }

    @Override
    public Model retrievePublicationById(final String id) {
        String uri = baseURI.getPublicationURI() + id;
        System.out.println("Attempting to retrieve: " + uri);
        try (QueryExecution qexec = QueryExecutionFactory.sparqlService(sparqlUri(), sqb.getGetResourceByIdQuery(uri))) {
            return qexec.execDescribe();
        }
    }

    @Override
    public void updateWork(final String work) {
        InputStream stream = new ByteArrayInputStream(work.getBytes(StandardCharsets.UTF_8));
        Model model = ModelFactory.createDefaultModel();
        RDFDataMgr.read(model, stream, Lang.JSONLD);
         
        UpdateRequest updateRequest = UpdateFactory.create(sqb.getUpdateWorkQueryString(model));
        UpdateExecutionFactory.createRemote(updateRequest, updateUri()).execute();
    }

    @Override
    public boolean askIfResourceExists(String uri) {
        try (QueryExecution qexec = QueryExecutionFactory.sparqlService(sparqlUri(), sqb.checkIfResourceExists(uri))){
            return qexec.execAsk();
        }
    }

    @Override
    public String createWork(String work) {
        InputStream stream = new ByteArrayInputStream(work.getBytes(StandardCharsets.UTF_8));
        String uri = uriGenerator.getNewURI("work", this::askIfResourceExists);
        Model tempModel = ModelFactory.createDefaultModel();
        Statement workResource = ResourceFactory.createStatement(
                PLACEHOLDER_RESOURCE,
                RDF.type,
                ResourceFactory.createResource(baseURI.getOntologyURI() + "Work"));
        tempModel.add(workResource);
        RDFDataMgr.read(tempModel, stream, Lang.JSONLD);

        UpdateAction.parseExecute(sqb.getReplaceSubjectQueryString(uri), tempModel);
        UpdateRequest updateRequest = UpdateFactory.create(sqb.getCreateQueryString(tempModel));
        UpdateExecutionFactory.createRemote(updateRequest, updateUri()).execute();
        return uri;
    }

    @Override
    public String createPublication(String publication) throws XPathExpressionException, Exception {
        String recordID = kohaAdapter.getNewBiblio();
        InputStream stream = new ByteArrayInputStream(publication.getBytes(StandardCharsets.UTF_8));
        String uri = uriGenerator.getNewURI("publication", this::askIfResourceExists);
        Model tempModel = ModelFactory.createDefaultModel();
        Statement publicationResource = ResourceFactory.createStatement(
                PLACEHOLDER_RESOURCE,
                RDF.type,
                ResourceFactory.createResource(baseURI.getOntologyURI() + "Publication"));
        Statement recordLink = ResourceFactory.createStatement(
                PLACEHOLDER_RESOURCE,
                ResourceFactory.createProperty(baseURI.getOntologyURI() + "recordID"),
                ResourceFactory.createTypedLiteral(recordID, XSDDatatype.XSDstring));
        tempModel.add(publicationResource);
        tempModel.add(recordLink);
        RDFDataMgr.read(tempModel, stream, Lang.JSONLD);

        UpdateAction.parseExecute(sqb.getReplaceSubjectQueryString(uri), tempModel);

        UpdateRequest updateRequest = UpdateFactory.create(sqb.getCreateQueryString(tempModel));
        UpdateExecutionFactory.createRemote(updateRequest, updateUri()).execute();
        return uri;
    }

    @Override
    public boolean askIfStatementExists(Statement statement) {
        try (QueryExecution qexec = QueryExecutionFactory.sparqlService(sparqlUri(), sqb.checkIfStatementExists(statement))){
            return qexec.execAsk();
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public void delete(Model inputModel) {
        UpdateRequest updateRequest = UpdateFactory.create(sqb.updateDelete(inputModel));
        UpdateExecutionFactory.createRemote(updateRequest, updateUri()).execute();
    }

    @Override
    public void patch(List<Patch> patches) {
        UpdateRequest updateRequest = UpdateFactory.create(sqb.patch(patches));
        UpdateExecutionFactory.createRemote(updateRequest, updateUri()).execute();
    }
}
