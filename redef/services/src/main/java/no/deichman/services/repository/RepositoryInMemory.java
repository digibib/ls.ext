package no.deichman.services.repository;

import com.hp.hpl.jena.datatypes.xsd.XSDDatatype;
import com.hp.hpl.jena.query.Dataset;
import com.hp.hpl.jena.query.DatasetFactory;
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

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;
import java.util.List;

import javax.xml.xpath.XPathExpressionException;

import no.deichman.services.kohaadapter.KohaAdapter;
import no.deichman.services.kohaadapter.KohaAdapterImpl;
import no.deichman.services.patch.Patch;
import no.deichman.services.uridefaults.BaseURIMock;
import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFDataMgr;

/**
 * Responsibility: TODO.
 */
public final class RepositoryInMemory implements Repository {

    private final Dataset model;
    private final SPARQLQueryBuilder sqb;
    private final BaseURIMock bud;
    private final UniqueURIGenerator uriGenerator;
    private final KohaAdapter kohaAdapter;

    public RepositoryInMemory() {
        bud = new BaseURIMock();
        sqb = new SPARQLQueryBuilder(bud);
        Model model2 = ModelFactory.createDefaultModel();
        model2.read("testdata.ttl", "TURTLE");
        model = DatasetFactory.createMem();
        model.setDefaultModel(model2);
        uriGenerator = new UniqueURIGenerator(this, new BaseURIMock());
        kohaAdapter = new KohaAdapterImpl();
    }

    public void addData(Model newData){
        model.getDefaultModel().add(newData);
    }

    public Model getModel() {
        return model.getDefaultModel();
    }

    public Dataset getDataset() {
        return model;
    }

    @Override
    public Model retrieveWorkById(String id) {
        String uri = bud.getWorkURI() + id;
        try (QueryExecution qexec = QueryExecutionFactory.create(sqb.describeWorkAndLinkedPublication(uri), model)) {
            return qexec.execDescribe();
        }
    }

    @Override
    public Model retrievePublicationById(String id) {
        String uri = bud.getPublicationURI() + id;
        try (QueryExecution qexec = QueryExecutionFactory.create(sqb.getGetResourceByIdQuery(uri), model)) {
            return qexec.execDescribe();
        }
    }

    @Override
    public void updateWork(String work) {
        InputStream stream = new ByteArrayInputStream(work.getBytes(StandardCharsets.UTF_8));
        Model tempModel = ModelFactory.createDefaultModel();
        RDFDataMgr.read(tempModel, stream, Lang.JSONLD);

        UpdateRequest updateRequest = UpdateFactory.create(sqb.getUpdateWorkQueryString(tempModel));
        UpdateAction.execute(updateRequest, model);
    }

    @Override
    public boolean askIfResourceExists(String uri) {
        try (QueryExecution qexec = QueryExecutionFactory.create(sqb.checkIfResourceExists(uri), model)) {
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
        UpdateAction.execute(updateRequest, model);

        return id;
    }


    public String createPublication(String publication) throws XPathExpressionException, Exception {
        String recordID = kohaAdapter.getNewBiblio();

        InputStream stream = new ByteArrayInputStream(publication.getBytes(StandardCharsets.UTF_8));
        String id = uriGenerator.getNewURI("publication");
        Model tempModel = ModelFactory.createDefaultModel();
        String publicationURI = uriGenerator.toString();
        Statement publicationResource = ResourceFactory.createStatement(
                ResourceFactory.createResource(publicationURI),
                RDF.type,
                ResourceFactory.createResource(bud.getOntologyURI() + "Publication"));
        Statement recordLink = ResourceFactory.createStatement(
                ResourceFactory.createResource(publicationURI),
                ResourceFactory.createProperty(bud.getOntologyURI() + "recordID"),
                ResourceFactory.createTypedLiteral(recordID, XSDDatatype.XSDstring));
        tempModel.add(publicationResource);
        tempModel.add(recordLink);
        RDFDataMgr.read(tempModel, stream, Lang.JSONLD);

        UpdateRequest updateRequest = UpdateFactory.create(sqb.getCreateQueryString(id, tempModel));
        UpdateAction.execute(updateRequest, model);

        return id;
    }

    @Override
    public boolean askIfStatementExists(Statement statement) {
        try (QueryExecution qexec = QueryExecutionFactory.create(sqb.checkIfStatementExists(statement), model)) {
            return qexec.execAsk();
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public void delete(Model inputModel) {
        UpdateRequest updateRequest = UpdateFactory.create(sqb.updateDelete(inputModel));
        UpdateAction.execute(updateRequest, model);
    }

    @Override
    public void patch(List<Patch> patches) {
        UpdateRequest updateRequest = UpdateFactory.create(sqb.patch(patches));
        UpdateAction.execute(updateRequest, model);
    }

}
