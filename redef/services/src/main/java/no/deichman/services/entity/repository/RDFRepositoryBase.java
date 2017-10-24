package no.deichman.services.entity.repository;

import com.google.common.collect.ImmutableSet;
import no.deichman.services.entity.EntityType;
import no.deichman.services.entity.patch.Patch;
import no.deichman.services.entity.patch.PatchParser;
import no.deichman.services.entity.patch.PatchParserException;
import no.deichman.services.uridefaults.BaseURI;
import no.deichman.services.uridefaults.XURI;
import org.apache.commons.lang3.tuple.Pair;
import org.apache.jena.datatypes.xsd.XSDDateTime;
import org.apache.jena.query.Query;
import org.apache.jena.query.QueryExecution;
import org.apache.jena.query.QuerySolution;
import org.apache.jena.query.ResultSet;
import org.apache.jena.query.ResultSetFactory;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.RDFNode;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdf.model.ResourceFactory;
import org.apache.jena.rdf.model.SimpleSelector;
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

import javax.ws.rs.NotFoundException;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collection;
import java.util.GregorianCalendar;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.function.Consumer;

import static com.google.common.collect.Lists.newArrayList;
import static java.util.Arrays.stream;
import static no.deichman.services.entity.patch.Patch.addPatch;
import static org.apache.commons.lang3.tuple.Pair.of;
import static org.apache.jena.datatypes.xsd.XSDDatatype.XSDdateTime;
import static org.apache.jena.datatypes.xsd.XSDDatatype.XSDstring;
import static org.apache.jena.rdf.model.ResourceFactory.createProperty;

/**
 * Responsibility: TODO.
 */
public abstract class RDFRepositoryBase implements RDFRepository {

    static final Resource PLACEHOLDER_RESOURCE = ResourceFactory.createResource("#");
    private static final SimpleSelector WITH_MIGRATION_FILTER = new SimpleSelector() {
        @Override
        public boolean test(Statement s) {
            switch (s.getPredicate().getNameSpace()) {
                case "http://migration.deichman.no/":
                case "http://data.deichman.no/raw#":
                    return false;
                default:
                    return true;
            }
        }
    };
    private static final Set<Property> UNCOPYABLE_PROPERTIES = ImmutableSet.of(
            createProperty(BaseURI.ontology("created")),
            createProperty(BaseURI.ontology("modified")),
            createProperty(BaseURI.ontology("hasPrimaryCataloguingSource")),
            createProperty(BaseURI.ontology("hasIdentifierInPrimaryCataloguingSource")),
            createProperty(BaseURI.ontology("hasImage")),
            createProperty(BaseURI.ontology("hasHomeBranch")),
            createProperty(BaseURI.ontology("hasAvailableBranch")),
            createProperty(BaseURI.ontology("hasNumItems"))
    );

    private final Logger log = LoggerFactory.getLogger(RDFRepositoryBase.class);
    private final SPARQLQueryBuilder sqb;
    private final UniqueURIGenerator uriGenerator;

    RDFRepositoryBase(SPARQLQueryBuilder sqb, UniqueURIGenerator uriGenerator) {
        this.sqb = sqb;
        this.uriGenerator = uriGenerator;
    }

    protected abstract QueryExecution getQueryExecution(Query query);

    protected abstract void executeUpdate(UpdateRequest updateRequest);

    @Override
    public final Model retrieveResourceByURI(XURI xuri, boolean withMigrationFilter) {
        log.debug("Attempting to retrieve resource <" + xuri.getUri() + ">");
        try (QueryExecution qexec = getQueryExecution(sqb.getGetResourceByIdQuery(xuri.getUri()))) {
            disableCompression(qexec);
            if (withMigrationFilter) {
                return qexec.execDescribe().query(WITH_MIGRATION_FILTER);
            }
            return qexec.execDescribe();
        }
    }

    @Override
    public final Model retrieveWorkAndLinkedResourcesByURI(XURI xuri) {
        log.debug("Attempting to retrieve: <" + xuri.getUri() + ">");
        try (QueryExecution qexec = getQueryExecution(sqb.describeWorkAndLinkedResources(xuri))) {
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
    public final Model retrieveCorporationAndLinkedResourcesByURI(String uri) {
        log.debug("Attempting to retrieve corporation: " + uri);
        try (QueryExecution qexec = getQueryExecution(sqb.describeCorporationAndLinkedResources(uri))) {
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
    public final void updateResource(String query) {
        UpdateRequest updateRequest = UpdateFactory.create(query);
        executeUpdate(updateRequest);
    }

    @Override
    public final XURI retrievePublicationXURIByRecordId(String recordId) throws Exception {
        try (QueryExecution qexec = getQueryExecution(sqb.getPublicationByRecordId(recordId))) {
            disableCompression(qexec);
            XURI publication = null;
            ResultSet resultSet = qexec.execSelect();

            if (resultSet.hasNext()) {
                publication = new XURI(resultSet.next().getResource("pub").toString());
            } else {
                throw new NotFoundException();
            }
            return publication;
        }

    }

    @Override
    public final boolean askIfResourceExists(XURI xuri) {
        try (QueryExecution qexec = getQueryExecution(sqb.checkIfResourceExists(xuri))) {
            disableCompression(qexec);
            return qexec.execAsk();
        }
    }

    @Override
    public final String createWork(Model inputModel) throws Exception {
        String type = "Work";
        return createResource(inputModel, type);
    }

    private String createResource(Model inputModel, String type, Pair<String, String>... additionalProperties) throws Exception {
        List<Statement> removeStatements = newArrayList();
        inputModel.listStatements().forEachRemaining(s -> {
            if (UNCOPYABLE_PROPERTIES.contains(s.getPredicate())) {
                removeStatements.add(s);
            }
        });
        inputModel.remove(removeStatements);
        Model createModel = inputModel.add(tempTypeStatement(type)).add(createdStatement(PLACEHOLDER_RESOURCE));
        if (additionalProperties != null) {
            stream(additionalProperties).forEach(pair -> createModel.add(simpleStatement(pair.getKey(), pair.getValue())));
        }
        String uri = uriGenerator.getNewURI(type, this::askIfResourceExists);
        UpdateAction.parseExecute(sqb.getReplaceSubjectQueryString(uri), createModel);
        UpdateRequest updateRequest = UpdateFactory.create(sqb.getCreateQueryString(createModel));
        executeUpdate(updateRequest);
        return uri;
    }

    @Override
    public final String createPerson(Model inputModel) throws Exception {
        return createResource(inputModel, "Person");
    }

    @Override
    public final String createPlace(Model inputModel) throws Exception {
        return createResource(inputModel, "Place");
    }

    @Override
    public final String createCorporation(Model inputModel) throws Exception {
        return createResource(inputModel, "Corporation");
    }

    @Override
    public final String createSerial(Model inputModel) throws Exception {
        return createResource(inputModel, "Serial");
    }

    @Override
    public final String createSubject(Model inputModel) throws Exception {
        return createResource(inputModel, "Subject");
    }

    @Override
    public final String createGenre(Model inputModel) throws Exception {
        return createResource(inputModel, "Genre");
    }

    @Override
    public final String createMusicalInstrument(Model inputModel) throws Exception {
        return createResource(inputModel, "Instrument");
    }

    @Override
    public final String createMusicalCompositionType(Model inputModel) throws Exception {
        return createResource(inputModel, "CompositionType");
    }

    @Override
    public final String createEvent(Model inputModel) throws Exception {
        return createResource(inputModel, "Event");
    }

    @Override
    public final void createResource(Model inputModel) throws Exception {
        UpdateRequest updateRequest = UpdateFactory.create(sqb.getCreateQueryString(inputModel.add(createdStatement(PLACEHOLDER_RESOURCE))));
        executeUpdate(updateRequest);
    }

    @Override
    public final String createPublication(Model inputModel, String recordId) throws Exception {
        return createResource(inputModel, "Publication", of("recordId", recordId));
    }

    private static Statement simpleStatement(String fragment, String value) {
        return ResourceFactory.createStatement(
                PLACEHOLDER_RESOURCE,
                createProperty(BaseURI.ontology() + fragment),
                ResourceFactory.createTypedLiteral(value, XSDstring));
    }

    private Statement tempTypeStatement(String clazz) {
        return ResourceFactory.createStatement(
                PLACEHOLDER_RESOURCE,
                RDF.type,
                ResourceFactory.createResource(BaseURI.ontology() + clazz));
    }

    private Statement createdStatement(Resource subject) {
        return createTimestampStatement(subject, "created");
    }

    private Statement modifiedStatement(Resource subject) {
        return createTimestampStatement(subject, "modified");
    }

    private Statement createTimestampStatement(Resource subject, String predicate) {
        XSDDateTime xsdDateTime = new XSDDateTime(GregorianCalendar.getInstance());
        return ResourceFactory.createStatement(
                subject,
                createProperty(BaseURI.ontology() + predicate),
                ResourceFactory.createTypedLiteral(xsdDateTime.toString(), XSDdateTime));
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
        UpdateRequest updateRequest = null;
        try {
            updateRequest = UpdateFactory.create(sqb.patch(PatchParser.createDeleteModelAsPatches(inputModel)));
        } catch (PatchParserException e) {
            throw new RuntimeException(e);
        }
        executeUpdate(updateRequest);
    }

    @Override
    public final void patch(List<Patch> patches, Resource subject) {
        ArrayList<Patch> copy = newArrayList(patches);
        copy.add(addPatch(modifiedStatement(subject), null));
        UpdateRequest updateRequest = UpdateFactory.create(sqb.patch(copy, subject));
        executeUpdate(updateRequest);
    }

    @Override
    public final Optional<String> getResourceURIByBibliofilId(String id, String type) {
        try (QueryExecution qexec = getQueryExecution(sqb.getImportedResourceById(id, type))) {
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
    public final Model retrieveWorksByCreator(XURI xuri) {
        log.debug("Attempting to retrieve: works created by " + xuri.getUri());
        try (QueryExecution qexec = getQueryExecution(sqb.describeWorksByCreator(xuri))) {
            disableCompression(qexec);
            return qexec.execDescribe();
        }
    }

    @Override
    public final void findAllUrisOfType(String type, Consumer<String> consumer) {
        log.debug("Attempting to retrieve all " + type + " uris: ");
        try (QueryExecution qexec = getQueryExecution(sqb.selectAllUrisOfType(type))) {
            disableCompression(qexec);
            qexec.execSelect().forEachRemaining(querySolution -> {
                consumer.accept(querySolution.get("uri").asResource().getURI());
            });
        }
    }

    @Override
    public final List<String> getWorkURIsByAgent(XURI agent) {
        List<String> res = new ArrayList<>();
        try (QueryExecution qexec = getQueryExecution(sqb.selectWorksByAgent(agent))) {
            disableCompression(qexec);
            qexec.execSelect().forEachRemaining(querySolution -> {
                res.add(querySolution.get("work").asResource().getURI());
            });
        }
        return res;
    }

    @Override
    public final List<String> retrieveRecordIdsByWork(XURI xuri) {
        List<String> recordIDs = new ArrayList<>();
        log.debug("Attempting to retrieve all recordIDs for " + xuri.getUri());
        try (QueryExecution qexec = getQueryExecution(sqb.getRecordIdsByWork(xuri))) {
            disableCompression(qexec);
            qexec.execSelect().forEachRemaining(
                    solution -> recordIDs.add(solution.get("recordId").toString())
            );
        }
        return recordIDs;
    }

    @Override
    public final Map<String, Integer> getNumberOfRelationsForResource(XURI uri) {
        Map result = new HashMap();
        try (QueryExecution qexec = getQueryExecution(sqb.getNumberOfRelationsForResource(uri))) {
            disableCompression(qexec);
            qexec.execSelect().forEachRemaining(
                    solution -> {
                        RDFNode type = solution.get("type");
                        if (type != null) {
                            result.put(type.toString(), solution.get("references").<Integer>asLiteral().getValue());
                        }
                    }
            );
        }
        return result;
    }

    @Override
    public final Model retrieveResourceByQuery(EntityType entityType, Map<String, String> queryParameters, Collection<String> projection) {
        try (QueryExecution qexec = getQueryExecution(sqb.constructFromQueryAndProjection(entityType, queryParameters, projection))) {
            disableCompression(qexec);
            return qexec.execConstruct();
        }
    }

    @Override
    public final Model describePublicationFromParsedCoreISBNQuery(String isbn) {
        log.debug("Looking up publication by isbn: " + isbn);
        try (QueryExecution qexec = getQueryExecution(sqb.describePublicationFromParsedCoreISBNQuery(isbn))) {
            disableCompression(qexec);
            return qexec.execDescribe();
        }
    }

    @Override
    public final String createWorkSeries(Model inputModel) throws Exception {
        String type = "WorkSeries";
        return createResource(inputModel, type);
    }

    @Override
    public final Model retrieveEventAndLinkedResourcesByURI(XURI eventUri) {
        log.debug("Attempting to retrieve: <" + eventUri.getUri() + ">");
        try (QueryExecution qexec = getQueryExecution(sqb.describeEventAndLinkedResources(eventUri))) {
            disableCompression(qexec);
            return qexec.execDescribe();
        }
    }

    @Override
    public final Model retrieveSerialAndLinkedResourcesByURI(XURI serialUri) {
        log.debug("Attempting to retrieve: <" + serialUri.getUri() + ">");
        try (QueryExecution qexec = getQueryExecution(sqb.describeSerialAndLinkedResources(serialUri))) {
            disableCompression(qexec);
            return qexec.execDescribe();
        }
    }

    @Override
    public final Set<String> retrievedResourcesConnectedTo(XURI xuri) {
        try (QueryExecution qexec = getQueryExecution(sqb.relatedResourcesFor(xuri))) {
            disableCompression(qexec);
            ResultSet results = qexec.execSelect();
            Set<String> res = new HashSet<String>();
            while (results.hasNext()) {
                QuerySolution binding = results.nextSolution();
                res.add(binding.get("resource").toString());
            }
            return res;
        }
    }

    @Override
    public final ResultSet retrieveResourceRelationships(XURI xuri) {
        log.debug("retrieving all participations for uri: " + xuri.getUri());
        try (QueryExecution qexec = getQueryExecution(sqb.retriveResourceRelationships(xuri))) {
            disableCompression(qexec);
            return ResultSetFactory.copyResults(qexec.execSelect());
        }
    }

    @Override
    public final void mergeResource(XURI xuri, XURI replaceeURI) {
        log.debug("Replacing instances of <" + replaceeURI + "> with <" + xuri + ">");
        UpdateRequest updateRequest = UpdateFactory.create(sqb.mergeNodes(xuri, replaceeURI));
        executeUpdate(updateRequest);
    }

    @Override
    public final void deleteIncomingRelations(XURI xuri) {
        log.debug("Removing incoming relations to <" + xuri + ">");
        UpdateRequest updateRequest = UpdateFactory.create(sqb.deleteIncomingRelations(xuri));
        executeUpdate(updateRequest);
    }

    @Override
    public final ResultSet retrievePublicationDataByRecordId(String recordId) {
        try (QueryExecution queryExecution =
                     getQueryExecution(sqb.getPublicationAndWorkContributorURIByRecordId(recordId))) {
            disableCompression(queryExecution);
            return  ResultSetFactory.copyResults(queryExecution.execSelect());
        }
    }

    @Override
    public final Model retrieveInverseRelations(XURI xuri, String predicate) {
        try (QueryExecution qexec = getQueryExecution(sqb.getGetInverselyRelatedResourceByPredicate(xuri.getUri(), predicate))) {
            disableCompression(qexec);
            return qexec.execDescribe().query(WITH_MIGRATION_FILTER);
        }
    }

    private void disableCompression(QueryExecution qexec) {
        if (qexec instanceof QueryEngineHTTP) {
            ((QueryEngineHTTP) qexec).setAllowCompression(false);
        }
    }
}
