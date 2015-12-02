package no.deichman.services.entity.repository;

import no.deichman.services.entity.patch.Patch;
import no.deichman.services.uridefaults.BaseURI;
import org.apache.jena.datatypes.xsd.XSDDatatype;
import org.apache.jena.query.Query;
import org.apache.jena.query.QueryExecution;
import org.apache.jena.query.ResultSet;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdf.model.ResourceFactory;
import org.apache.jena.rdf.model.Statement;
import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFDataMgr;
import org.apache.jena.sparql.engine.http.QueryEngineHTTP;
import org.apache.jena.update.UpdateAction;
import org.apache.jena.update.UpdateFactory;
import org.apache.jena.update.UpdateRequest;
import org.apache.jena.vocabulary.RDF;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Optional;

/**
 * Responsibility: TODO.
 */
public abstract class RDFRepositoryBase implements RDFRepository {

    private static final Resource PLACEHOLDER_RESOURCE = ResourceFactory.createResource("#");

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
    public final Model retrieveWorkByURI(String uri) {
        log.debug("Attempting to retrieve: <" + uri + ">");
        try (QueryExecution qexec = getQueryExecution(sqb.getGetResourceByIdQuery(uri))) {
            disableCompression(qexec);
            return qexec.execDescribe();
        }
    }

    @Override
    public final Model retrieveWorkAndLinkedResourcesByURI(String uri) {
        log.debug("Attempting to retrieve: <" + uri + ">");
        try (QueryExecution qexec = getQueryExecution(sqb.describeWorkAndLinkedResources(uri))) {
            disableCompression(qexec);
            return qexec.execDescribe();
        }
    }

    @Override
    public final Model retrievePublicationByURI(final String uri) {
        log.debug("Attempting to retrieve: " + uri);
        try (QueryExecution qexec = getQueryExecution(sqb.getGetResourceByIdQuery(uri))) {
            disableCompression(qexec);
            return qexec.execDescribe();
        }
    }

    @Override
    public final Model retrievePersonByURI(String uri) {
        log.debug("Attempting to retrieve: " + uri);
        try (QueryExecution qexec = getQueryExecution(sqb.getGetResourceByIdQuery(uri))) {
            disableCompression(qexec);
            return qexec.execDescribe();
        }
    }

    @Override
    public final Model retrievePersonAndLinkedResourcesByURI(String uri) {
        log.debug("Attempting to retrieve person: " + uri);
        try (QueryExecution qexec = getQueryExecution(sqb.describePersonAndLinkedResources(uri))) {
            disableCompression(qexec);
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
            disableCompression(qexec);
            return qexec.execAsk();
        }
    }

    @Override
    public final String createWork(Model inputModel) {
        String type = "Work";
        inputModel.add(tempTypeStatement(type));
        String uri = uriGenerator.getNewURI(type, this::askIfResourceExists);

        UpdateAction.parseExecute(sqb.getReplaceSubjectQueryString(uri), inputModel);

        UpdateRequest updateRequest = UpdateFactory.create(sqb.getCreateQueryString(inputModel));
        executeUpdate(updateRequest);
        return uri;
    }

    @Override
    public final String createPerson(Model inputModel) {
        String type = "Person";
        inputModel.add(tempTypeStatement(type));
        String uri = uriGenerator.getNewURI(type, this::askIfResourceExists);

        UpdateAction.parseExecute(sqb.getReplaceSubjectQueryString(uri), inputModel);

        UpdateRequest updateRequest = UpdateFactory.create(sqb.getCreateQueryString(inputModel));
        executeUpdate(updateRequest);
        return uri;
    }

    @Override
    public final String createPublication(Model inputModel, String recordID) {
        String type = "Publication";

        inputModel.add(tempTypeStatement(type));
        String uri = uriGenerator.getNewURI(type, this::askIfResourceExists);

        inputModel.add(tempRecordIdStatement(recordID));

        UpdateAction.parseExecute(sqb.getReplaceSubjectQueryString(uri), inputModel);
        UpdateRequest updateRequest = UpdateFactory.create(sqb.getCreateQueryString(inputModel));
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
            disableCompression(qexec);
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

    @Override
    public final Optional<String> getResourceURIByBibliofilId(String personId) {
        try (QueryExecution qexec = getQueryExecution(sqb.getBibliofilPersonResource(personId))) {
            disableCompression(qexec);
            ResultSet resultSet = qexec.execSelect();
            boolean uri = resultSet.hasNext();
            if (uri) {
                return Optional.of(resultSet.next().getResource("uri").toString());
            }
        }
        return Optional.empty();
    }

    @Override
    public final Model retrieveWorksByCreator(String creatorId) {
        String uri = baseURI.person() + creatorId;
        log.debug("Attempting to retrieve: works created by " + uri);
        try (QueryExecution qexec = getQueryExecution(sqb.describeWorksByCreator(uri))) {
            disableCompression(qexec);
            return qexec.execDescribe();
        }
    }

    @Override
    public final Model retrievePublicationsByWork(String id) {
        String uri = baseURI.work() + id;
        log.debug("Attempting to retrieve: " + uri);
        ResultSet resultSet;
        try (QueryExecution qexec = getQueryExecution(sqb.describeLinkedPublications(uri))) {
            disableCompression(qexec);
            return qexec.execDescribe();
        }
    }

    private void disableCompression(QueryExecution qexec) {
        if (qexec instanceof QueryEngineHTTP) {
            ((QueryEngineHTTP) qexec).setAllowGZip(false);
            ((QueryEngineHTTP) qexec).setAllowDeflate(false);
        }
    }
}
