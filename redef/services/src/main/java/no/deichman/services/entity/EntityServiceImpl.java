package no.deichman.services.entity;

import no.deichman.services.entity.kohaadapter.KohaAdapter;
import no.deichman.services.entity.kohaadapter.MarcConstants;
import no.deichman.services.entity.kohaadapter.MarcField;
import no.deichman.services.entity.kohaadapter.MarcRecord;
import no.deichman.services.entity.patch.PatchParser;
import no.deichman.services.entity.repository.RDFRepository;
import no.deichman.services.entity.repository.SPARQLQueryBuilder;
import no.deichman.services.uridefaults.BaseURI;
import no.deichman.services.uridefaults.XURI;
import org.apache.commons.lang3.StringUtils;
import org.apache.jena.query.Query;
import org.apache.jena.query.QueryExecution;
import org.apache.jena.query.QueryExecutionFactory;
import org.apache.jena.query.QueryFactory;
import org.apache.jena.query.QuerySolution;
import org.apache.jena.query.ResultSet;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.rdf.model.NodeIterator;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.RDFNode;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdf.model.ResourceFactory;
import org.apache.jena.rdf.model.Statement;
import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFDataMgr;
import org.apache.jena.vocabulary.RDF;

import javax.ws.rs.BadRequestException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.function.Consumer;
import java.util.function.Predicate;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.util.stream.StreamSupport;

import static java.util.stream.Collectors.groupingBy;

/**
 * Responsibility: TODO.
 */
public final class EntityServiceImpl implements EntityService {

    private static final String LANGUAGE_TTL_FILE = "language.ttl";
    private static final String AUDIENCE_TTL_FILE = "audience.ttl";
    private static final String FORMAT_TTL_FILE = "format.ttl";
    private static final String NATIONALITY_TTL_FILE = "nationality.ttl";
    private final RDFRepository repository;
    private final KohaAdapter kohaAdapter;
    private final BaseURI baseURI;
    private final Property hasItemProperty;
    private final Property mainTitleProperty;
    private final Property nameProperty;
    private final Property agentProperty;
    private final Property publicationOfProperty;
    private final Property recordIdProperty;
    private final Property partTitleProperty;
    private final Property partNumberProperty;
    private final Property isbnProperty;
    private final Property publicationYearProperty;


    public EntityServiceImpl(BaseURI baseURI, RDFRepository repository, KohaAdapter kohaAdapter) {
        this.baseURI = baseURI;
        this.repository = repository;
        this.kohaAdapter = kohaAdapter;
        hasItemProperty = ResourceFactory.createProperty(baseURI.ontology("hasItem"));
        mainTitleProperty = ResourceFactory.createProperty(baseURI.ontology("mainTitle"));
        nameProperty = ResourceFactory.createProperty(baseURI.ontology("name"));
        agentProperty = ResourceFactory.createProperty(baseURI.ontology("agent"));
        publicationOfProperty = ResourceFactory.createProperty(baseURI.ontology("publicationOf"));
        recordIdProperty = ResourceFactory.createProperty(baseURI.ontology("recordID"));
        partTitleProperty = ResourceFactory.createProperty(baseURI.ontology("partTitle"));
        partNumberProperty = ResourceFactory.createProperty(baseURI.ontology("partNumber"));
        isbnProperty = ResourceFactory.createProperty(baseURI.ontology("isbn"));
        publicationYearProperty = ResourceFactory.createProperty(baseURI.ontology("publicationYear"));
    }

    private static Set<Resource> objectsOfProperty(Property property, Model inputModel) {
        Set<Resource> resources = new HashSet<>();
        inputModel
                .listObjectsOfProperty(property)
                .forEachRemaining(r -> resources.add(r.asResource()));
        return resources;
    }

    private static <T> Stream<T> streamFrom(Iterator<T> sourceIterator) {
        Iterable<T> iterable = () -> sourceIterator;
        return StreamSupport.stream(iterable.spliterator(), false);
    }

    private Model getLinkedLexvoResource(Model input) {

        NodeIterator objects = input.listObjects();
        if (objects.hasNext()) {
            Set<RDFNode> objectResources = objects.toSet();
            objectResources.stream()
                    .filter(node -> node.toString()
                            .contains("http://lexvo.org/id/iso639-3/")).collect(Collectors.toList())
                    .forEach(lv -> {
                        input.add(extractNamedResourceFromModel(lv.toString(), EntityServiceImpl.class.getClassLoader().getResourceAsStream(LANGUAGE_TTL_FILE), Lang.TURTLE));
                    });
        }

        return input;
    }

    private Model getLinkedFormatResource(Model input) {
        return getLinkedResource(input, "format", FORMAT_TTL_FILE);
    }

    private Model getLinkedAudienceResource(Model input) {
        return getLinkedResource(input, "audience", AUDIENCE_TTL_FILE);
    }

    private Model getLinkedNationalityResource(Model input) {
        return getLinkedResource(input, "nationality", NATIONALITY_TTL_FILE);
    }

    private Model getLinkedResource(Model input, String path, String filename) {
        NodeIterator objects = input.listObjects();
        if (objects.hasNext()) {
            Set<RDFNode> objectResources = objects.toSet();
            objectResources.stream()
                    .filter(node -> node.toString()
                            .contains("http://data.deichman.no/" + path + "#")).collect(Collectors.toList())
                    .forEach(result -> {
                        input.add(extractNamedResourceFromModel(result.toString(), EntityServiceImpl.class.getClassLoader().getResourceAsStream(filename), Lang.TURTLE)
                        );
                    });
        }

        return input;
    }

    private Model extractNamedResourceFromModel(String resource, InputStream input, Lang lang) {
        Model tempModel = ModelFactory.createDefaultModel();
        RDFDataMgr.read(tempModel, input, lang);
        QueryExecution qexec = QueryExecutionFactory.create(
                QueryFactory.create("DESCRIBE <" + resource + ">"),
                tempModel);
        return qexec.execDescribe();
    }

    private Predicate<Statement> typeStatement(String type) {
        return s ->
                s.getPredicate().equals(RDF.type) && s.getObject().equals(ResourceFactory.createResource(baseURI.ontology() + type));
    }

    @Override
    public Model retrieveById(XURI xuri) {
        Model m = ModelFactory.createDefaultModel();
        m.add(repository.retrieveResourceByURI(xuri));
        return m;
    }

    @Override
    public Model retrieveWorkWithLinkedResources(XURI xuri) {
        Model m = ModelFactory.createDefaultModel();
        m.add(repository.retrieveWorkAndLinkedResourcesByURI(xuri));
        m = getLinkedLexvoResource(m);
        m = getLinkedFormatResource(m);
        m = getLinkedAudienceResource(m);
        return m;
    }

    @Override
    public Model retrievePersonWithLinkedResources(XURI xuri) {
        Model m = ModelFactory.createDefaultModel();
        m.add(repository.retrievePersonAndLinkedResourcesByURI(xuri.getUri()));
        m = getLinkedNationalityResource(m);
        return m;
    }

    @Override
    public XURI updateHoldingBranches(String recordId, String branches) throws Exception {
        SPARQLQueryBuilder sqb = new SPARQLQueryBuilder(BaseURI.remote());
        String query = sqb.updateHoldingBranches(recordId, branches);
        repository.updateResource(query);

        return repository.retrieveWorkByRecordId(recordId);
    }

    @Override
    public void updateWork(String work) {
        repository.updateWork(work);
    }

    @Override
    public Model retrieveWorkItemsByURI(XURI xuri) {
        Model allItemsModel = ModelFactory.createDefaultModel();

        Model workModel = repository.retrieveWorkAndLinkedResourcesByURI(xuri);
        QueryExecution queryExecution = QueryExecutionFactory.create(QueryFactory.create(
                "PREFIX  deichman: <" + baseURI.ontology() + "> "
                        + "SELECT  * "
                        + "WHERE { ?publicationUri deichman:recordID ?biblioId }"), workModel);
        ResultSet publicationSet = queryExecution.execSelect();

        while (publicationSet.hasNext()) {
            QuerySolution solution = publicationSet.next();
            RDFNode publicationUri = solution.get("publicationUri");
            String biblioId = solution.get("biblioId").asLiteral().getString();

            Model itemsForBiblio = kohaAdapter.getBiblio(biblioId);

            SPARQLQueryBuilder sqb = new SPARQLQueryBuilder(baseURI);
            Query query = sqb.getItemsFromModelQuery(publicationUri.toString());
            QueryExecution qexec = QueryExecutionFactory.create(query, itemsForBiblio);
            Model itemsModelWithBlankNodes = qexec.execConstruct();

            allItemsModel.add(itemsModelWithBlankNodes);
        }
        return allItemsModel;
    }

    @Override
    public String create(EntityType type, Model inputModel) throws Exception {
        String uri;
        switch (type) {
            case PUBLICATION:
                uri = createPublication(inputModel);
                break;
            case WORK:
                uri = repository.createWork(inputModel);
                break;
            case PERSON:
                uri = repository.createPerson(inputModel);
                break;
            case PLACE:
                uri = repository.createPlace(inputModel);
                break;
            case PUBLISHER:
                uri = repository.createPublisher(inputModel);
                break;
            case SERIAL:
                uri = repository.createSerial(inputModel);
                break;
            case SUBJECT:
                uri = repository.createSubject(inputModel);
                break;
            case GENRE:
                uri = repository.createGenre(inputModel);
                break;
            default:
                throw new IllegalArgumentException("Unknown entity type:" + type);
        }
        return uri;
    }

    @Override
    public void create(Model inputModel) throws Exception {
        repository.createResource(inputModel);
    }

    private String createPublication(Model inputModel) throws Exception {
        Set<Resource> items = objectsOfProperty(hasItemProperty, inputModel);
        Model modelWithoutItems;
        if (items.isEmpty()) {
            modelWithoutItems = inputModel;
        } else {
            modelWithoutItems = ModelFactory.createDefaultModel();
        }

        List<String> personNames;
        if (inputModel.contains(null, publicationOfProperty)) {
            Model work = repository.retrieveWorkAndLinkedResourcesByURI(new XURI(inputModel.getProperty(null, publicationOfProperty).getObject().toString()));
            if (work.isEmpty()) {
                throw new BadRequestException("Associated work does not exist.");
            }
            personNames = getPersonNames(work);
        } else {
            personNames = new ArrayList<>();
        }

        MarcRecord marcRecord = generateMarcRecordForPublication(inputModel, personNames);
        streamFrom(inputModel.listStatements())
                .collect(groupingBy(Statement::getSubject))
                .forEach((subject, statements) -> {
                    if (items.contains(subject)) {
                        marcRecord.addMarcField(as952Subfields(statements));
                    } else {
                        statements.forEach(s -> {
                            if (!s.getPredicate().equals(hasItemProperty)) {
                                modelWithoutItems.add(s);
                            }
                        });
                    }
                });

        return repository.createPublication(
                modelWithoutItems,
                kohaAdapter.getNewBiblioWithMarcRecord(marcRecord)
        );
    }

    private MarcField as952Subfields(List<Statement> statements) {
        MarcField marcField = MarcRecord.newDataField(MarcConstants.FIELD_952);

        statements.forEach(s -> {
            String predicate = s.getPredicate().getURI();
            String fieldCode = predicate.substring(predicate.lastIndexOf("/") + 1);

            RDFNode object = s.getObject();
            if (object.isLiteral() && !(fieldCode.length() > 1)) {
                marcField.addSubfield(fieldCode.charAt(0), object.asLiteral().getString());
            }
        });
        return marcField;
    }

    @Override
    public void delete(Model model) {
        repository.delete(model);
    }

    @Override
    public Model patch(XURI xuri, String ldPatchJson) throws Exception {
        if (StringUtils.isBlank(ldPatchJson)) {
            throw new BadRequestException("Empty JSON-LD patch");
        }
        repository.patch(PatchParser.parse(ldPatchJson));

        return synchronizeKoha(xuri);
    }

    @Override
    public Model synchronizeKoha(XURI xuri) throws Exception {

        Model model = retrieveById(xuri);

        if (xuri.getTypeAsEntityType().equals(EntityType.PERSON)) {
            Model works = repository.retrieveWorksByCreator(xuri);
            streamFrom(works.listStatements())
                    .collect(groupingBy(Statement::getSubject))
                    .forEach((subject, statements) -> {
                        if (subject.isAnon()) {
                            return;
                        }
                        Model work = ModelFactory.createDefaultModel();
                        work.add(statements);
                        work.add(ResourceFactory.createStatement(
                                subject,
                                ResourceFactory.createProperty(baseURI.ontology() + "agent"),
                                ResourceFactory.createResource(xuri.getUri())));
                        XURI workXuri = null;
                        try {
                            workXuri = new XURI(subject.toString());
                        } catch (Exception e) {
                            e.printStackTrace();
                        }
                        updatePublicationsByWork(workXuri, work);
                    });
        } else if (xuri.getTypeAsEntityType().equals(EntityType.WORK)) {
            updatePublicationsByWork(xuri, model);
        } else if (xuri.getTypeAsEntityType().equals(EntityType.PUBLICATION) && model.getProperty(null, publicationOfProperty) != null) {
            XURI workXURI = new XURI(model.getProperty(null, publicationOfProperty).getObject().toString());
            updatePublicationWithWork(workXURI, model);
        } else if (xuri.getTypeAsEntityType().equals(EntityType.PUBLICATION)) {
            updatePublicationInKoha(model, new ArrayList<>());
        }
        return model;
    }

    private void updatePublicationWithWork(XURI workXURI, Model publication) {
        Model work = repository.retrieveResourceByURI(workXURI);
        List<String> personNames = getPersonNames(work);
        updatePublicationInKoha(publication, personNames);
    }

    private void updatePublicationsByWork(XURI xuri, Model work) {

        List<String> personNames = getPersonNames(work);
        Model publications = repository.retrievePublicationsByWork(xuri);

        streamFrom(publications.listStatements())
                .collect(groupingBy(Statement::getSubject))
                .forEach((subject, statements) -> {
                    if (isPublication(statements)) {
                        Model publication = ModelFactory.createDefaultModel();
                        publication.add(statements);
                        updatePublicationInKoha(publication, personNames);
                    }
                });
    }

    private boolean isPublication(List<Statement> statements) {
        return statements.stream().anyMatch(typeStatement("Publication"));
    }

    private void updatePublicationInKoha(Model publication, List<String> personNames) {
        MarcRecord marcRecord = generateMarcRecordForPublication(publication, personNames);
        kohaAdapter.updateRecord(publication.getProperty(null, recordIdProperty).getString(), marcRecord);
    }

    private MarcRecord generateMarcRecordForPublication(Model publication, List<String> personNames) {
        MarcRecord marcRecord = new MarcRecord();

        for (String personName : personNames) {
            marcRecord.addMarcField(MarcConstants.FIELD_100, MarcConstants.SUBFIELD_A, personName);
        }
        if (publication.getProperty(null, mainTitleProperty) != null) {
            marcRecord.addMarcField(MarcConstants.FIELD_245, MarcConstants.SUBFIELD_A,
                    publication.getProperty(null, mainTitleProperty).getLiteral().getString());
        }
        if (publication.getProperty(null, partTitleProperty) != null) {
            marcRecord.addMarcField(MarcConstants.FIELD_245, MarcConstants.SUBFIELD_P,
                    publication.getProperty(null, partTitleProperty).getLiteral().getString());
        }
        if (publication.getProperty(null, partNumberProperty) != null) {
            marcRecord.addMarcField(MarcConstants.FIELD_245, MarcConstants.SUBFIELD_N,
                    publication.getProperty(null, partNumberProperty).getLiteral().getString());
        }
        if (publication.getProperty(null, isbnProperty) != null) {
            marcRecord.addMarcField(MarcConstants.FIELD_020, MarcConstants.SUBFIELD_A,
                    publication.getProperty(null, isbnProperty).getLiteral().getString());
        }
        if (publication.getProperty(null, publicationYearProperty) != null) {
            marcRecord.addMarcField(MarcConstants.FIELD_260, MarcConstants.SUBFIELD_C,
                    publication.getProperty(null, publicationYearProperty).getLiteral().getString());
        }

        return marcRecord;
    }


    private List<String> getPersonNames(Model work) {
        List<String> personNames = new ArrayList<>();

        for (Statement stmt : work.listStatements().toList()) {
            if (stmt.getPredicate().equals(agentProperty)) {
                try {
                    Model person = repository.retrieveResourceByURI(new XURI(stmt.getObject().toString()));
                    NodeIterator nameIterator = person.listObjectsOfProperty(nameProperty);
                    while (nameIterator.hasNext()) {
                        personNames.add(nameIterator.next().asLiteral().toString());
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }

        return personNames;
    }

    @Override
    public boolean resourceExists(XURI xuri) {
        return repository.askIfResourceExists(xuri);
    }

    @Override
    public Model retrieveWorksByCreator(XURI xuri) {
        return repository.retrieveWorksByCreator(xuri);
    }

    @Override

    public void retrieveAllWorkUris(String type, Consumer<String> uriConsumer) {
        repository.findAllUrisOfType(type, uriConsumer);
    }

    @Override
    public Optional<String> retrieveImportedResource(String id, String type) {
        return repository.getResourceURIByBibliofilId(id, type);
    }
}
