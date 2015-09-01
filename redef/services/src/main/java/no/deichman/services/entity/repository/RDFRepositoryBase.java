package no.deichman.services.entity.repository;

import com.hp.hpl.jena.datatypes.xsd.XSDDatatype;
import com.hp.hpl.jena.query.Query;
import com.hp.hpl.jena.query.QueryExecution;
import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;
import com.hp.hpl.jena.rdf.model.Resource;
import com.hp.hpl.jena.rdf.model.ResourceFactory;
import com.hp.hpl.jena.rdf.model.Statement;
import com.hp.hpl.jena.update.UpdateAction;
import com.hp.hpl.jena.update.UpdateFactory;
import com.hp.hpl.jena.update.UpdateRequest;
import com.hp.hpl.jena.vocabulary.RDF;
import no.deichman.services.entity.patch.Patch;
import no.deichman.services.rdf.RDFModelUtil;
import no.deichman.services.uridefaults.BaseURI;
import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFDataMgr;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * Responsibility: TODO.
 */
public abstract class RDFRepositoryBase implements RDFRepository {

    public static final Resource PLACEHOLDER_RESOURCE = ResourceFactory.createResource("#");

    private final Logger log = LoggerFactory.getLogger(this.getClass());
    private final BaseURI baseURI;
    private final SPARQLQueryBuilder sqb;
    private final UniqueURIGenerator uriGenerator;

    RDFRepositoryBase(BaseURI baseURI, SPARQLQueryBuilder sqb, UniqueURIGenerator uriGenerator) {
        this.baseURI = baseURI;
        this.sqb = sqb;
        this.uriGenerator = uriGenerator;
    }

    protected abstract QueryExecution getQueryExecution(Query query);

    protected abstract void executeUpdate(UpdateRequest updateRequest);

    @Override
    public final Model retrieveWorkById(String id) {
        String uri = baseURI.work() + id;
        log.debug("Attempting to retrieve: " + uri);
        try (QueryExecution qexec = getQueryExecution(sqb.describeWorkAndLinkedPublication(uri))) {
            return qexec.execDescribe();
        }
    }

    @Override
    public final Model retrievePublicationById(final String id) {
        String uri = baseURI.publication() + id;
        log.debug("Attempting to retrieve: " + uri);
        try (QueryExecution qexec = getQueryExecution(sqb.getGetResourceByIdQuery(uri))) {
            return qexec.execDescribe();
        }
    }

    @Override
    public final void updateWork(String work) {
        InputStream stream = new ByteArrayInputStream(work.getBytes(StandardCharsets.UTF_8));
        Model model = ModelFactory.createDefaultModel();
        RDFDataMgr.read(model, stream, Lang.JSONLD);

        UpdateRequest updateRequest = UpdateFactory.create(sqb.getUpdateWorkQueryString(model));
        executeUpdate(updateRequest);
    }

    @Override
    public final boolean askIfResourceExists(String uri) {
        try (QueryExecution qexec = getQueryExecution(sqb.checkIfResourceExists(uri))){
            return qexec.execAsk();
        }
    }

    @Override
    public final String createWork(String workJsonLd) {
        String type = "Work";

        Model tempModel = RDFModelUtil.modelFrom(workJsonLd, Lang.JSONLD);
        tempModel.add(tempTypeStatement(type));

        String uri = uriGenerator.getNewURI(type, this::askIfResourceExists);
        UpdateAction.parseExecute(sqb.getReplaceSubjectQueryString(uri), tempModel);

        UpdateRequest updateRequest = UpdateFactory.create(sqb.getCreateQueryString(tempModel));
        executeUpdate(updateRequest);
        return uri;
    }

    @Override
    public final String createPublication(String publicationJsonLd, String recordID) {
        String type = "Publication";

        Model tempModel = RDFModelUtil.modelFrom(publicationJsonLd, Lang.JSONLD);
        tempModel.add(tempTypeStatement(type));
        tempModel.add(tempRecordIdStatement(recordID));

        String uri = uriGenerator.getNewURI(type, this::askIfResourceExists);
        UpdateAction.parseExecute(sqb.getReplaceSubjectQueryString(uri), tempModel);

        UpdateRequest updateRequest = UpdateFactory.create(sqb.getCreateQueryString(tempModel));
        executeUpdate(updateRequest);
        return uri;
    }

    private Statement tempRecordIdStatement(String recordID) {
        return ResourceFactory.createStatement(
                PLACEHOLDER_RESOURCE,
                ResourceFactory.createProperty(baseURI.ontology() + "recordID"),
                ResourceFactory.createTypedLiteral(recordID, XSDDatatype.XSDstring));
    }

    private Statement tempTypeStatement(String clazz) {
        return ResourceFactory.createStatement(
                PLACEHOLDER_RESOURCE,
                RDF.type,
                ResourceFactory.createResource(baseURI.ontology() + clazz));
    }

    @Override
    public final boolean askIfStatementExists(Statement statement) {
        try (QueryExecution qexec = getQueryExecution(sqb.checkIfStatementExists(statement))) {
            return qexec.execAsk();
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public final void delete(Model inputModel) {
        UpdateRequest updateRequest = UpdateFactory.create(sqb.updateDelete(inputModel));
        executeUpdate(updateRequest);
    }

    @Override
    public final void patch(List<Patch> patches) {
        UpdateRequest updateRequest = UpdateFactory.create(sqb.patch(patches));
        executeUpdate(updateRequest);
    }
}
