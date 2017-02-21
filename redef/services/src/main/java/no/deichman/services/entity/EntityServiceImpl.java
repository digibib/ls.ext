package no.deichman.services.entity;

import com.jamonapi.proxy.MonProxyFactory;
import no.deichman.services.entity.kohaadapter.KohaAdapter;
import no.deichman.services.entity.kohaadapter.MarcConstants;
import no.deichman.services.entity.kohaadapter.MarcField;
import no.deichman.services.entity.kohaadapter.MarcRecord;
import no.deichman.services.entity.patch.Patch;
import no.deichman.services.entity.patch.PatchParser;
import no.deichman.services.entity.repository.RDFRepository;
import no.deichman.services.entity.repository.SPARQLQueryBuilder;
import no.deichman.services.search.InMemoryNameIndexer;
import no.deichman.services.search.NameEntry;
import no.deichman.services.search.NameIndexer;
import no.deichman.services.uridefaults.BaseURI;
import no.deichman.services.uridefaults.XURI;
import org.apache.commons.lang3.StringUtils;
import org.apache.jena.query.Query;
import org.apache.jena.query.QueryException;
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
import org.apache.jena.rdf.model.SimpleSelector;
import org.apache.jena.rdf.model.Statement;
import org.apache.jena.rdf.model.StmtIterator;
import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFDataMgr;
import org.apache.jena.vocabulary.RDF;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.ws.rs.BadRequestException;
import java.io.InputStream;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.Timer;
import java.util.TimerTask;
import java.util.function.Consumer;
import java.util.function.Predicate;
import java.util.stream.Stream;

import static java.util.Arrays.stream;
import static java.util.Optional.ofNullable;
import static java.util.Spliterator.ORDERED;
import static java.util.Spliterators.spliteratorUnknownSize;
import static java.util.stream.Collectors.groupingBy;
import static java.util.stream.Collectors.toList;
import static java.util.stream.Collectors.toSet;
import static java.util.stream.StreamSupport.stream;
import static no.deichman.services.search.SearchServiceImpl.LOCAL_INDEX_SEARCH_FIELDS;
import static no.deichman.services.uridefaults.BaseURI.ontology;
import static org.apache.jena.rdf.model.ResourceFactory.createResource;

/**
 * Responsibility: TODO.
 */
public final class EntityServiceImpl implements EntityService {
    private final Logger log = LoggerFactory.getLogger(EntityServiceImpl.class);

    public static final Integer THREE = 3;

    private static final String LANGUAGE_TTL_FILE = "language.ttl";
    private static final String AUDIENCE_TTL_FILE = "audience.ttl";
    private static final String FORMAT_TTL_FILE = "format.ttl";
    private static final String NATIONALITY_TTL_FILE = "nationality.ttl";
    private static final String MEDIATYPE_TTL_FILE = "mediaType.ttl";
    private static final String WORKTYPE_TTL_FILE = "workType.ttl";
    private static final String ROLE_TTL_FILE = "role.ttl";
    private static final String LITERARYFORM_TTL_FILE = "literaryForm.ttl";
    private static final String CONTENTADAPTATION_TTL_FILE = "contentAdaptation.ttl";
    private static final String FORMATADAPTATION_TTL_FILE = "formatAdaptation.ttl";
    private static final String WRITINGSYSTEM_TTL_FILE = "writingSystem.ttl";
    private static final String BIOGRAPHY_TTL_FILE = "biography.ttl";
    private final RDFRepository repository;
    private final KohaAdapter kohaAdapter;
    private final Property mainTitleProperty;
    private final Property publicationOfProperty;
    private final Property recordIdProperty;
    private final Property partTitleProperty;
    private final Property partNumberProperty;
    private final Property isbnProperty;
    private final Property publicationYearProperty;
    private final Property subtitleProperty;
    private final Property ageLimitProperty;
    private final Property subjectProperty;
    private final Property genreProperty;
    private final Property mainEntryPersonProperty;
    private final Property mainEntryCorporationProperty;
    private final Property publicationPlaceProperty;
    private final Property literaryFormProperty;
    private final Property literaryFormLabelProperty;
    private final Property languageProperty;
    private final Property workTypeProperty;
    private final Property mediaTypeProperty;
    private final Property formatLabelProperty;
    private final Property adaptaionProperty;
    private final Property fictionNonFictionProperty;
    private final Property summaryProperty;
    private final Property audienceProperty;
    private final Property locationFormatProperty;
    private final Property locationDeweyProperty;
    private final Property locationSignatureProperty;

    private final String nonfictionResource = "http://data.deichman.no/fictionNonfiction#nonfiction";
    private final String fictionResource = "http://data.deichman.no/fictionNonfiction#fiction";
    private static Map<EntityType, NameIndexer> nameIndexers = new HashMap<EntityType, NameIndexer>();

    public EntityServiceImpl(RDFRepository repository, KohaAdapter kohaAdapter) {
        this.repository = repository;
        this.kohaAdapter = kohaAdapter;
        mainTitleProperty = ResourceFactory.createProperty(BaseURI.ontology("mainTitle"));
        publicationOfProperty = ResourceFactory.createProperty(BaseURI.ontology("publicationOf"));
        recordIdProperty = ResourceFactory.createProperty(BaseURI.ontology("recordId"));
        partTitleProperty = ResourceFactory.createProperty(BaseURI.ontology("partTitle"));
        partNumberProperty = ResourceFactory.createProperty(BaseURI.ontology("partNumber"));
        isbnProperty = ResourceFactory.createProperty(BaseURI.ontology("isbn"));
        publicationYearProperty = ResourceFactory.createProperty(BaseURI.ontology("publicationYear"));
        subtitleProperty = ResourceFactory.createProperty(BaseURI.ontology("subtitle"));
        ageLimitProperty = ResourceFactory.createProperty(BaseURI.ontology("ageLimit"));
        subjectProperty = ResourceFactory.createProperty(BaseURI.ontology("subject"));
        genreProperty = ResourceFactory.createProperty(BaseURI.ontology("genre"));
        mainEntryPersonProperty = ResourceFactory.createProperty(BaseURI.ontology("mainEntryPerson"));
        mainEntryCorporationProperty = ResourceFactory.createProperty(BaseURI.ontology("mainEntryCorporation"));
        publicationPlaceProperty = ResourceFactory.createProperty(BaseURI.ontology("publicationPlace"));
        literaryFormProperty = ResourceFactory.createProperty(BaseURI.ontology("literaryForm"));
        literaryFormLabelProperty = ResourceFactory.createProperty(BaseURI.ontology("literaryFormLabel"));
        languageProperty = ResourceFactory.createProperty(BaseURI.ontology("language"));
        workTypeProperty = ResourceFactory.createProperty(BaseURI.ontology("workType"));
        mediaTypeProperty = ResourceFactory.createProperty(BaseURI.ontology("mediaType"));
        formatLabelProperty = ResourceFactory.createProperty(BaseURI.ontology("formatLabel"));
        adaptaionProperty = ResourceFactory.createProperty(BaseURI.ontology("adaptationLabel"));
        fictionNonFictionProperty = ResourceFactory.createProperty(BaseURI.ontology("fictionNonfiction"));
        summaryProperty = ResourceFactory.createProperty(BaseURI.ontology("summary"));
        audienceProperty = ResourceFactory.createProperty(BaseURI.ontology("audience"));
        locationFormatProperty = ResourceFactory.createProperty(BaseURI.ontology("locationFormat"));
        locationDeweyProperty = ResourceFactory.createProperty(BaseURI.ontology("locationDewey"));
        locationSignatureProperty = ResourceFactory.createProperty(BaseURI.ontology("locationSignature"));

        new Timer().schedule(new TimerTask() {
            @Override
            public void run() {
                Arrays.stream(EntityType.values()).forEach(type -> getNameIndexer(type));
            }
        }, 0);
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
        return stream(iterable.spliterator(), false);
    }

    private Model getLinkedLexvoResource(Model input) {

        NodeIterator objects = input.listObjects();
        if (objects.hasNext()) {
            Set<RDFNode> objectResources = objects.toSet();
            objectResources.stream()
                    .filter(node -> node.toString()
                            .contains("http://lexvo.org/id/iso639-3/")).collect(toList())
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

    private Model getLinkedMediaTypeResource(Model input) {
        return getLinkedResource(input, "mediaType", MEDIATYPE_TTL_FILE);
    }

    private Model getLinkedLiteraryFormResource(Model input) {
        return getLinkedResource(input, "literaryForm", LITERARYFORM_TTL_FILE);
    }

    private Model getLinkedContentAdaptationResource(Model input) {
        return getLinkedResource(input, "contentAdaptation", CONTENTADAPTATION_TTL_FILE);
    }

    private Model getLinkedFormatAdaptationResource(Model input) {
        return getLinkedResource(input, "formatAdaptation", FORMATADAPTATION_TTL_FILE);
    }

    private Model getLinkedWorkTypeResource(Model input) {
        return getLinkedResource(input, "workType", WORKTYPE_TTL_FILE);
    }

    private Model getLinkedWritingSystemResource(Model input) {
        return getLinkedResource(input, "writingSystem", WRITINGSYSTEM_TTL_FILE);
    }

    private Model getLinkedBiographySystemResource(Model input) {
        return getLinkedResource(input, "biography", BIOGRAPHY_TTL_FILE);
    }

    private Model getLinkedRoleResource(Model input) {
        return getLinkedResource(input, "role", ROLE_TTL_FILE);
    }

    private Model getLinkedResource(Model input, String path, String filename) {
        NodeIterator objects = input.listObjects();
        if (objects.hasNext()) {
            Set<RDFNode> objectResources = objects.toSet();
            objectResources.stream()
                    .filter(node -> node.toString()
                            .contains("http://data.deichman.no/" + path + "#")).collect(toList())
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
                s.getPredicate().equals(RDF.type) && s.getObject().equals(createResource(BaseURI.ontology() + type));
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
        m = addInversePublicationRelations(m, xuri);
        m = getLinkedLexvoResource(m);
        m = getLinkedFormatResource(m);
        m = getLinkedAudienceResource(m);
        m = getLinkedNationalityResource(m);
        m = getLinkedMediaTypeResource(m);
        m = getLinkedLiteraryFormResource(m);
        m = getLinkedContentAdaptationResource(m);
        m = getLinkedFormatAdaptationResource(m);
        m = getLinkedWorkTypeResource(m);
        m = getLinkedRoleResource(m);
        m = getLinkedWritingSystemResource(m);
        m = getLinkedBiographySystemResource(m);
        return m;
    }

    private Model addInversePublicationRelations(Model input, XURI workUri) {
        try {
            SPARQLQueryBuilder sparqlQueryBuilder = new SPARQLQueryBuilder();
            Query query = sparqlQueryBuilder.constructInversePublicationRelations(workUri);
            QueryExecution queryExecution = QueryExecutionFactory.create(query, input);
            Model model = ModelFactory.createDefaultModel();
            queryExecution.execConstruct(model);
            return input.add(model);
        } catch (QueryException e) {
            return input;
        }
    }

    @Override
    public Model retrievePersonWithLinkedResources(XURI xuri) {
        Model m = ModelFactory.createDefaultModel();
        m.add(repository.retrievePersonAndLinkedResourcesByURI(xuri.getUri()));
        m = getLinkedNationalityResource(m);
        return m;
    }

    @Override
    public Model retrieveCorporationWithLinkedResources(XURI xuri) {
        Model m = ModelFactory.createDefaultModel();
        m.add(repository.retrieveCorporationAndLinkedResourcesByURI(xuri.getUri()));
        m = getLinkedNationalityResource(m);
        return m;
    }

    @Override
    public XURI updateHoldingBranches(String recordId, String branches) throws Exception {
        SPARQLQueryBuilder sqb = new SPARQLQueryBuilder();
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
                "PREFIX  deichman: <" + BaseURI.ontology() + "> "
                        + "SELECT  * "
                        + "WHERE { ?publicationUri deichman:recordId ?biblioId }"), workModel);
        ResultSet publicationSet = queryExecution.execSelect();

        while (publicationSet.hasNext()) {
            QuerySolution solution = publicationSet.next();
            RDFNode publicationUri = solution.get("publicationUri");
            String biblioId = solution.get("biblioId").asLiteral().getString();

            Model itemsForBiblio = kohaAdapter.getBiblio(biblioId);

            SPARQLQueryBuilder sqb = new SPARQLQueryBuilder();
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
            case CORPORATION:
                uri = repository.createCorporation(inputModel);
                break;
            case SERIAL:
                uri = repository.createSerial(inputModel);
                break;
            case WORK_SERIES:
                uri = repository.createWorkSeries(inputModel);
                break;
            case SUBJECT:
                uri = repository.createSubject(inputModel);
                break;
            case GENRE:
                uri = repository.createGenre(inputModel);
                break;
            case MUSICAL_INSTRUMENT:
                uri = repository.createMusicalInstrument(inputModel);
                break;
            case MUSICAL_COMPOSITION_TYPE:
                uri = repository.createMusicalCompositionType(inputModel);
                break;
            case EVENT:
                uri = repository.createEvent(inputModel);
                break;
            default:
                throw new IllegalArgumentException("Unknown entity type:" + type);
        }
        return uri;
    }

    private String createPublication(Model inputModel) throws Exception {

        XURI publication = null;
        StmtIterator statements = inputModel.listStatements();
        while (publication == null && statements.hasNext()) {
            Resource subject = statements.next().getSubject();
            if (!subject.isAnon()) {
                publication = new XURI(subject.toString());
            }
        }

        MarcRecord marcRecord;
        if (inputModel.contains(null, publicationOfProperty)) {
            Model work = repository.retrieveWorkAndLinkedResourcesByURI(new XURI(inputModel.getProperty(null, publicationOfProperty).getObject().toString()));
            if (work.isEmpty()) {
                throw new BadRequestException("Associated work does not exist.");
            }
            marcRecord = generateMarcRecordForPublication(publication, work.add(inputModel));
        } else {
            marcRecord = generateMarcRecordForPublication(publication, inputModel);
        }

        String recordId = kohaAdapter.createNewBiblioWithMarcRecord(marcRecord);

        return repository.createPublication(
                inputModel,
                recordId
        );
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
        List<Patch> patches = PatchParser.parse(ldPatchJson);
        repository.patch(patches, createResource(xuri.getUri()));
        patches.stream().filter(patch -> patch.getOperation().equals("del") && isNameStatement(patch.getStatement(), LOCAL_INDEX_SEARCH_FIELDS))
                .forEach(patch -> removeIndexedName(xuri.getTypeAsEntityType(), patch.getStatement().getString(), xuri.getUri()));
        return synchronizeKoha(xuri);
    }

    @Override
    public Model synchronizeKoha(XURI xuri) throws Exception { // TODO why must this method return model?

        Model model;

        if (xuri.getTypeAsEntityType().equals(EntityType.PERSON)) {
            model = retrieveById(xuri); // TODO Who needs this model?

            List<String> resources = repository.getWorkURIsByAgent(xuri);
            for (String resource : resources) {
                try {
                    XURI resXuri = new XURI(resource);
                    Model work = retrieveWorkWithLinkedResources(resXuri);
                    updatePublicationsByWork(work);
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        } else if (xuri.getTypeAsEntityType().equals(EntityType.WORK)) {
            model = retrieveWorkWithLinkedResources(xuri);
            updatePublicationsByWork(model);
        } else if (xuri.getTypeAsEntityType().equals(EntityType.PUBLICATION)) {
            model = retrieveById(xuri);
            if (model.getProperty(null, publicationOfProperty) != null) {
                XURI workXURI = new XURI(model.getProperty(createResource(xuri.toString()), publicationOfProperty).getObject().toString());
                updatePublicationWithWork(workXURI, xuri);
            } else {
                updatePublicationInKoha(xuri, model);
            }
        } else {
            model = retrieveById(xuri);
        }
        return model;
    }

    private void updatePublicationWithWork(XURI workXURI, XURI publication) {
        Model work = retrieveWorkWithLinkedResources(workXURI);
        updatePublicationInKoha(publication, work);
    }

    private void updatePublicationsByWork(Model work) {
        streamFrom(work.listStatements())
                .collect(groupingBy(Statement::getSubject))
                .forEach((subject, statements) -> {
                    if (isPublication(statements)) {
                        try {
                            XURI publicationXURI = new XURI(subject.toString());
                            updatePublicationInKoha(publicationXURI, work);
                        } catch (Exception e) {
                            e.printStackTrace();
                        }
                    }
                });
    }

    private boolean isPublication(List<Statement> statements) {
        return statements.stream().anyMatch(typeStatement("Publication"));
    }

    private void updatePublicationInKoha(XURI publication, Model work) {
        MarcRecord marcRecord = generateMarcRecordForPublication(publication, work);
        kohaAdapter.updateRecord(work.getProperty(publication.getAsResource(), recordIdProperty).getString(), marcRecord);
    }

    public MarcRecord generateMarcRecordForPublication(XURI publication, Model work) {

        MarcRecord marcRecord = new MarcRecord();
        if (publication == null) {
            return marcRecord;
        }

        MarcField field245 = MarcRecord.newDataField(MarcConstants.FIELD_245);
        MarcField field260 = MarcRecord.newDataField(MarcConstants.FIELD_260);
        MarcField field041 = MarcRecord.newDataField(MarcConstants.FIELD_041);
        MarcField field090 = MarcRecord.newDataField(MarcConstants.FIELD_090);

        Query query = new SPARQLQueryBuilder().constructInformationForMARC(publication);
        try (QueryExecution qexec = QueryExecutionFactory.create(query, work)) {
            Model pubModel = qexec.execConstruct();
            StmtIterator iter = pubModel.listStatements();
            while (iter.hasNext()) {
                Statement stmt = iter.nextStatement();
                Property pred = stmt.getPredicate();
                if (pred.equals(mainEntryPersonProperty)) {
                    marcRecord.addMarcField(MarcConstants.FIELD_100, MarcConstants.SUBFIELD_A, stmt.getLiteral().getString());
                } else if (pred.equals(mainEntryCorporationProperty)) {
                    marcRecord.addMarcField(MarcConstants.FIELD_110, MarcConstants.SUBFIELD_A, stmt.getLiteral().getString());
                    // We also duplicate corporation MainEntry to field 100$a, as this is needed for Koha to display it as "author"
                    marcRecord.addMarcField(MarcConstants.FIELD_100, MarcConstants.SUBFIELD_A, stmt.getLiteral().getString());
                } else if (pred.equals(publicationYearProperty)) {
                    field260.addSubfield(MarcConstants.SUBFIELD_C, stmt.getLiteral().getString());
                } else if (pred.equals(publicationPlaceProperty)) {
                    field260.addSubfield(MarcConstants.SUBFIELD_A, stmt.getLiteral().getString());
                } else if (pred.equals(isbnProperty)) {
                    marcRecord.addMarcField(MarcConstants.FIELD_020, MarcConstants.SUBFIELD_A, stmt.getLiteral().getString());
                } else if (pred.equals(mainTitleProperty)) {
                    field245.addSubfield(MarcConstants.SUBFIELD_A, stmt.getLiteral().getString());
                } else if (pred.equals(subtitleProperty)) {
                    field245.addSubfield(MarcConstants.SUBFIELD_B, stmt.getLiteral().getString());
                } else if (pred.equals(partTitleProperty)) {
                    field245.addSubfield(MarcConstants.SUBFIELD_P, stmt.getLiteral().getString());
                } else if (pred.equals(partNumberProperty)) {
                    field245.addSubfield(MarcConstants.SUBFIELD_N, stmt.getLiteral().getString());
                } else if (pred.equals(ageLimitProperty)) {
                    marcRecord.addMarcField(MarcConstants.FIELD_521, MarcConstants.SUBFIELD_A, String.format("Aldersgrense %s", stmt.getLiteral().getString()));
                } else if (pred.equals(subjectProperty)) {
                    String[] parts = stmt.getLiteral().getString().split("__");
                    if (parts.length == 2) {
                        MarcField field650 = MarcRecord.newDataField(MarcConstants.FIELD_650);
                        field650.addSubfield(MarcConstants.SUBFIELD_A, parts[0]);
                        field650.addSubfield(MarcConstants.SUBFIELD_Q, parts[1]);
                        marcRecord.addMarcField(field650);
                    } else {
                        marcRecord.addMarcField(MarcConstants.FIELD_650, MarcConstants.SUBFIELD_A, parts[0]);
                    }
                } else if (pred.equals(genreProperty)) {
                    marcRecord.addMarcField(MarcConstants.FIELD_655, MarcConstants.SUBFIELD_A, stmt.getLiteral().getString());
                } else if (pred.equals(fictionNonFictionProperty)) {
                    Resource obj = stmt.getObject().asResource();
                    if (obj.hasURI(fictionResource)) {
                        marcRecord.addControlField(MarcConstants.FIELD_008, MarcConstants.FIELD_008_FICTION);
                    } else if (obj.hasURI(nonfictionResource)) {
                        marcRecord.addControlField(MarcConstants.FIELD_008, MarcConstants.FIELD_008_NONFICTION);
                    }
                } else if (pred.equals(literaryFormLabelProperty)) {
                    marcRecord.addMarcField(MarcConstants.FIELD_655, MarcConstants.SUBFIELD_A, stmt.getLiteral().getString());
                } else if (pred.equals(languageProperty)) {
                    String langCode = stmt.getObject().asResource().getURI();
                    langCode = langCode.substring(langCode.length() - THREE);
                    field041.addSubfield(MarcConstants.SUBFIELD_A, langCode);
                } else if (pred.equals(workTypeProperty)) {
                    marcRecord.addMarcField(MarcConstants.FIELD_336, MarcConstants.SUBFIELD_A, stmt.getLiteral().getString());
                } else if (pred.equals(mediaTypeProperty)) {
                    marcRecord.addMarcField(MarcConstants.FIELD_337, MarcConstants.SUBFIELD_A, stmt.getLiteral().getString());
                } else if (pred.equals(formatLabelProperty)) {
                    marcRecord.addMarcField(MarcConstants.FIELD_338, MarcConstants.SUBFIELD_A, stmt.getLiteral().getString());
                } else if (pred.equals(adaptaionProperty) || pred.equals(audienceProperty)) {
                    marcRecord.addMarcField(MarcConstants.FIELD_385, MarcConstants.SUBFIELD_A, stmt.getLiteral().getString());
                } else if (pred.equals(summaryProperty)) {
                    marcRecord.addMarcField(MarcConstants.FIELD_520, MarcConstants.SUBFIELD_A, stmt.getLiteral().getString());
                } else if (pred.equals(locationFormatProperty)) {
                    field090.addSubfield(MarcConstants.SUBFIELD_B, stmt.getLiteral().getString());
                } else if (pred.equals(locationDeweyProperty)) {
                    field090.addSubfield(MarcConstants.SUBFIELD_C, stmt.getLiteral().getString());
                } else if (pred.equals(locationSignatureProperty)) {
                    field090.addSubfield(MarcConstants.SUBFIELD_D, stmt.getLiteral().getString());
                }
            }
        }

        if (field245.size() > 0) {
            marcRecord.addMarcField(field245);
        }

        if (field260.size() > 0) {
            marcRecord.addMarcField(field260);
        }

        if (field041.size() > 0) {
            marcRecord.addMarcField(field041);
        }

        if (field090.size() > 0) {
            marcRecord.addMarcField(field090);
        }

        return marcRecord;
    }

    @Override
    public boolean resourceExists(XURI xuri) {
        return repository.askIfResourceExists(xuri);
    }

    @Override
    public Model retrieveWorksByCreator(XURI xuri) {
        Model m = ModelFactory.createDefaultModel();
        m = repository.retrieveWorksByCreator(xuri);
        m = getLinkedRoleResource(m);
        m = getLinkedWorkTypeResource(m);
        return m;
    }

    @Override

    public void retrieveAllWorkUris(String type, Consumer<String> uriConsumer) {
        repository.findAllUrisOfType(type, uriConsumer);
    }

    @Override
    public Optional<String> retrieveImportedResource(String id, String type) {
        return repository.getResourceURIByBibliofilId(id, type);
    }

    @Override
    public List<String> retrieveWorkRecordIds(XURI xuri) {
        return repository.retrieveRecordIdsByWork(xuri);
    }

    @Override
    public Map<String, Integer> getNumberOfRelationsForResource(XURI uri) {
        return repository.getNumberOfRelationsForResource(uri);
    }

    @Override
    public Model retrieveResourceByQuery(EntityType entityType, Map<String, String> queryParameters, Collection<String> projection) {
        return repository.retrieveResourceByQuery(entityType, queryParameters, projection);
    }

    @Override
    public Model retrieveEventWithLinkedResources(XURI eventUri) {
        Model m = ModelFactory.createDefaultModel();
        m.add(repository.retrieveEventAndLinkedResourcesByURI(eventUri));
        return m;
    }

    @Override
    public Model retrieveSerialWithLinkedResources(XURI serialUri) {
        Model m = ModelFactory.createDefaultModel();
        m.add(repository.retrieveSerialAndLinkedResourcesByURI(serialUri));
        return m;
    }

    @Override
    public Set<String> retrieveResourcesConnectedTo(XURI xuri) {
        return repository.retrievedResourcesConnectedTo(xuri);
    }

    @Override
    public Collection<NameEntry> neighbourhoodOfName(EntityType type, String name, int width) {
        return getNameIndexer(type).neighbourhoodOf(name, width);
    }

    public StmtIterator statementsInModelAbout(final XURI xuri, final Model indexModel, final String... possibleNamePredicates) {
        return indexModel.listStatements(new SimpleSelector() {
            @Override
            public boolean test(Statement s) {
                return (isNameStatement(s, possibleNamePredicates)
                        && isAboutRelevantType(s, indexModel, xuri));
            }
        });
    }

    @Override
    public List<RelationshipGroup> retrieveResourceRelationships(final XURI uri) {
        return stream(spliteratorUnknownSize(repository.retrieveResourceRelationships(uri), ORDERED), false)
                .map(this::getRelationship)
                .collect(groupingBy(Relationship::getRelationshipType))
                .entrySet().stream().map(RelationshipGroup::new).collect(toList());
    }

    @Override
    public List<XURI> retrieveResourceRelationshipsUris(XURI uri) {
        return stream(spliteratorUnknownSize(repository.retrieveResourceRelationships(uri), ORDERED), false)
                .filter(s -> s.contains("targetUri"))
                .map(this::targetUri).collect(toSet()).stream().sorted().collect(toList());
    }

    private Relationship getRelationship(QuerySolution querySolution) {
        Relationship relationship = new Relationship();
        relationship.setRelationshipType(querySolution.getResource("relation"));
        relationship.setMainTitle(querySolution.getLiteral("mainTitle").getString());
        ofNullable(querySolution.getLiteral("subtitle")).ifPresent(relationship::setSubtitle);
        ofNullable(querySolution.getLiteral("partTitle")).ifPresent(relationship::setPartTitle);
        ofNullable(querySolution.getLiteral("partNumber")).ifPresent(relationship::setPartNumber);
        ofNullable(querySolution.getLiteral("publicationYear")).ifPresent(relationship::setPublicationYear);
        ofNullable(querySolution.getLiteral("prefLabel")).ifPresent(relationship::setPrefLabel);
        ofNullable(querySolution.getLiteral("alternativeName")).ifPresent(relationship::setAlternativeName);
        ofNullable(querySolution.getResource("type")).ifPresent(relationship::setTargetType);
        ofNullable(querySolution.getResource("targetUri")).ifPresent(relationship::setTargetUri);
        return relationship;
    }

    private XURI targetUri(QuerySolution querySolution)  {
        try {
            return new XURI(querySolution.getResource("targetUri").getURI());
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public void mergeResource(XURI xuri, XURI replaceeUri) {
        repository.mergeResource(xuri, replaceeUri);
    }

    @Override
    public void removeFromLocalIndex(XURI xuri) {
        getNameIndexer(xuri.getTypeAsEntityType()).removeUri(xuri.getUri());
    }

    private boolean isAboutRelevantType(Statement s, Model model, XURI xuri) {
        return model.contains(s.getSubject(), RDF.type, ResourceFactory.createResource(ontology(xuri.getTypeAsEntityType().getRdfType())));
    }

    private boolean isNameStatement(Statement s, String[] predicates) {
        return stream(predicates).anyMatch(p -> s.getPredicate().equals(ResourceFactory.createResource(p)));
    }

    private NameIndexer getNameIndexer(EntityType type) {
        NameIndexer nameIndexer = nameIndexers.get(type);
        if (nameIndexer == null) {
            log.info("Creating local index for " + type);
            long start = System.currentTimeMillis();
            ResultSet resultSet = repository.retrieveAllNamesOfType(type);
            nameIndexer = (NameIndexer) MonProxyFactory.monitor(new InMemoryNameIndexer(resultSet));
            if (!nameIndexer.isEmpty()) {
                nameIndexers.put(type, nameIndexer);
            }
            log.info(String.format("Created local index for %s with %d entries in %d msec", type, nameIndexer.size(), System.currentTimeMillis() - start));
        }
        return nameIndexer;
    }

    @Override
    public void addIndexedName(EntityType type, String name, String uri) {
        getNameIndexer(type).addNamedItem(name, uri);
    }

    private void removeIndexedName(EntityType type, String name, String uri) {
        getNameIndexer(type).removeNamedItem(name, uri);
    }
}
