package no.deichman.services.entity;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.reflect.TypeToken;
import no.deichman.services.circulation.CirculationObject;
import no.deichman.services.circulation.CirculationProfile;
import no.deichman.services.circulation.ExpandedRecord;
import no.deichman.services.circulation.HoldsAndPickups;
import no.deichman.services.circulation.Loan;
import no.deichman.services.circulation.Pickup;
import no.deichman.services.circulation.RawHold;
import no.deichman.services.circulation.RawLoan;
import no.deichman.services.circulation.Record;
import no.deichman.services.circulation.Reservation;
import no.deichman.services.entity.kohaadapter.KohaAdapter;
import no.deichman.services.entity.kohaadapter.MarcConstants;
import no.deichman.services.entity.kohaadapter.MarcField;
import no.deichman.services.entity.kohaadapter.MarcRecord;
import no.deichman.services.entity.patch.Patch;
import no.deichman.services.entity.patch.PatchParser;
import no.deichman.services.entity.repository.RDFRepository;
import no.deichman.services.entity.repository.SPARQLQueryBuilder;
import no.deichman.services.uridefaults.BaseURI;
import no.deichman.services.uridefaults.XURI;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.tuple.Pair;
import org.apache.jena.query.Query;
import org.apache.jena.query.QueryException;
import org.apache.jena.query.QueryExecution;
import org.apache.jena.query.QueryExecutionFactory;
import org.apache.jena.query.QueryFactory;
import org.apache.jena.query.QuerySolution;
import org.apache.jena.query.ResultSet;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.RDFNode;
import org.apache.jena.rdf.model.ResIterator;
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
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.function.Consumer;
import java.util.function.Predicate;
import java.util.stream.Stream;

import static com.google.common.collect.Lists.newArrayList;
import static java.util.Arrays.stream;
import static java.util.Optional.ofNullable;
import static java.util.Spliterator.ORDERED;
import static java.util.Spliterators.spliteratorUnknownSize;
import static java.util.stream.Collectors.groupingBy;
import static java.util.stream.Collectors.toList;
import static java.util.stream.Collectors.toMap;
import static java.util.stream.Collectors.toSet;
import static java.util.stream.StreamSupport.stream;
import static no.deichman.services.uridefaults.BaseURI.ontology;
import static org.apache.jena.rdf.model.ResourceFactory.createProperty;
import static org.apache.jena.rdf.model.ResourceFactory.createResource;

/**
 * Responsibility: TODO.
 */
public final class EntityServiceImpl implements EntityService {
    public static final Gson GSON = new GsonBuilder().create();
    public static final String HOLD_IS_FOUND = "W";
    private final Logger log = LoggerFactory.getLogger(EntityServiceImpl.class);

    public static final Integer THREE = 3;

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
    private final Property cataloguingSourceLabel;
    private final Property cataloguingSourceIdentifier;

    private final String nonfictionResource = "http://data.deichman.no/fictionNonfiction#nonfiction";
    private final String fictionResource = "http://data.deichman.no/fictionNonfiction#fiction";

    public EntityServiceImpl(RDFRepository repository, KohaAdapter kohaAdapter) {
        this.repository = repository;
        this.kohaAdapter = kohaAdapter;
        mainTitleProperty = createProperty(ontology("mainTitle"));
        publicationOfProperty = createProperty(ontology("publicationOf"));
        recordIdProperty = createProperty(ontology("recordId"));
        partTitleProperty = createProperty(ontology("partTitle"));
        partNumberProperty = createProperty(ontology("partNumber"));
        isbnProperty = createProperty(ontology("isbn"));
        publicationYearProperty = createProperty(ontology("publicationYear"));
        subtitleProperty = createProperty(ontology("subtitle"));
        ageLimitProperty = createProperty(ontology("ageLimit"));
        subjectProperty = createProperty(ontology("subject"));
        genreProperty = createProperty(ontology("genre"));
        mainEntryPersonProperty = createProperty(ontology("mainEntryPerson"));
        mainEntryCorporationProperty = createProperty(ontology("mainEntryCorporation"));
        publicationPlaceProperty = createProperty(ontology("publicationPlace"));
        literaryFormProperty = createProperty(ontology("literaryForm"));
        literaryFormLabelProperty = createProperty(ontology("literaryFormLabel"));
        languageProperty = createProperty(ontology("language"));
        workTypeProperty = createProperty(ontology("workType"));
        mediaTypeProperty = createProperty(ontology("mediaType"));
        formatLabelProperty = createProperty(ontology("formatLabel"));
        adaptaionProperty = createProperty(ontology("adaptationLabel"));
        fictionNonFictionProperty = createProperty(ontology("fictionNonfiction"));
        summaryProperty = createProperty(ontology("summary"));
        audienceProperty = createProperty(ontology("audience"));
        locationFormatProperty = createProperty(ontology("locationFormat"));
        locationDeweyProperty = createProperty(ontology("locationDewey"));
        locationSignatureProperty = createProperty(ontology("locationSignature"));
        cataloguingSourceLabel = createProperty(ontology("cataloguingSourceLabel"));
        cataloguingSourceIdentifier = createProperty(ontology("cataloguingSourceIdentifier"));

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
                s.getPredicate().equals(RDF.type) && s.getObject().equals(createResource(ontology() + type));
    }

    @Override
    public Model retrieveById(XURI xuri) {
        Model m = ModelFactory.createDefaultModel();
        m.add(repository.retrieveResourceByURI(xuri, true));
        return m;
    }

    @Override
    public Model retrieveCompleteResourceById(XURI xuri){
        Model m = ModelFactory.createDefaultModel();
        m.add(repository.retrieveResourceByURI(xuri, false));
        return m;
    }

    @Override
    public Model retrieveWorkWithLinkedResources(XURI xuri) {
        Model m = ModelFactory.createDefaultModel();
        m.add(repository.retrieveWorkAndLinkedResourcesByURI(xuri));
        m = addInversePublicationRelations(m, xuri);
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
        return repository.retrievePersonAndLinkedResourcesByURI(xuri.getUri());
    }

    @Override
    public Model retrieveCorporationWithLinkedResources(XURI xuri) {
        return repository.retrieveCorporationAndLinkedResourcesByURI(xuri.getUri());
    }

    @Override
    public Model retrieveAuthorizedValuesFor(String type) {
        return repository.retrieveAuthorizedValuesFor(type);
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
                "PREFIX  deichman: <" + ontology() + "> "
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

        List<Statement> removeStatements = newArrayList();
        inputModel.listStatements().forEachRemaining(s -> {
            if (s.getPredicate().equals(ResourceFactory.createProperty(BaseURI.ontology("recordId")))) {
                removeStatements.add(s);
            }
        });
        inputModel.remove(removeStatements);

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

        MarcField field015 = MarcRecord.newDataField(MarcConstants.FIELD_015);
        MarcField field260 = MarcRecord.newDataField(MarcConstants.FIELD_260);
        MarcField field041 = MarcRecord.newDataField(MarcConstants.FIELD_041);
        MarcField field090 = MarcRecord.newDataField(MarcConstants.FIELD_090);
        String mainTitle = "";
        String subtitle = "";
        String partNumber = "";
        String partTitle = "";

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
                    mainTitle = stmt.getLiteral().getString();
                } else if (pred.equals(subtitleProperty)) {
                    subtitle = stmt.getLiteral().getString();
                } else if (pred.equals(partTitleProperty)) {
                    partTitle = stmt.getLiteral().getString();
                } else if (pred.equals(partNumberProperty)) {
                    partNumber = stmt.getLiteral().getString();
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
                } else if (pred.equals(cataloguingSourceLabel)) {
                    field015.addSubfield(MarcConstants.SUBFIELD_B, stmt.getLiteral().getString());
                } else if (pred.equals(cataloguingSourceIdentifier)) {
                    field015.addSubfield(MarcConstants.SUBFIELD_A, stmt.getLiteral().getString());
                } else if (pred.equals(publicationOfProperty)) {
                    String workUri = stmt.getObject().asResource().getURI();
                    System.out.println(workUri);
                    marcRecord.addMarcField(MarcConstants.FIELD_856, MarcConstants.SUBFIELD_U, workUri);
                }
            }
        }

        String title = mainTitle;
        if (subtitle != "") {
            title += " : " + subtitle;
        }
        if (partNumber != "") {
            title += ". " + partNumber;
        }
        if (partTitle != "") {
            title += ". " + partTitle;
        }
        if (title != "") {
            MarcField field245 = MarcRecord.newDataField(MarcConstants.FIELD_245);
            field245.addSubfield(MarcConstants.SUBFIELD_A, title);
            marcRecord.addMarcField(field245);
        }

        if (field015.size() > 0) {
            marcRecord.addMarcField(field015);
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
    public Model describePublicationFromParsedCoreISBNQuery(String isbn) {
        return repository.describePublicationFromParsedCoreISBNQuery(isbn);
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
                .map(this::targetUri)
                .filter(Objects::nonNull)
                .collect(toSet()).stream().sorted().collect(toList());
    }

    @Override
    public CirculationProfile getProfile(String borrowerId) throws Exception {
        CirculationProfile circulationProfile = new CirculationProfile();
        circulationProfile.setLoans(getLoans(borrowerId));
        HoldsAndPickups holdsAndPickups = getHolds(borrowerId);
        circulationProfile.setPickups(holdsAndPickups.getPickups());
        circulationProfile.setHolds(holdsAndPickups.getHolds());
        return circulationProfile;
    }

    private CirculationObject rawHoldToCirculationObject(RawHold rawHold) {
        CirculationObject circulationObject;
        Expectation expectation = new Expectation();
        if (Objects.equals(rawHold.getStatus(), HOLD_IS_FOUND)) {
            Pickup pickup = new Pickup();
            pickup.setExpirationDate(rawHold.getWaitingDate());
            pickup.setPickupNumber(rawHold.getPickupNumber());
            circulationObject = pickup;
        } else {
            Reservation reservation = new Reservation();
            ExpandedRecord expandedRecord = GSON.fromJson(
                    kohaAdapter.retrieveBiblioExpanded(rawHold.getRecordId()),
                    new TypeToken<ExpandedRecord>() {}.getType());
            Record record = expandedRecord.getRecord();
            reservation.setEstimatedWait(
                    expectation.estimate(
                            Integer.parseInt(rawHold.getQueuePlace()),
                            expandedRecord.getItems(),
                            record.getBehindExpiditedUserAsBoolean()));
            reservation.setQueuePlace(rawHold.getQueuePlace());
            reservation.setSuspended(convertBooleanString(Optional.ofNullable(rawHold.getSuspended()).orElse("0")));
            reservation.setOrderedDate(Optional.ofNullable(rawHold.getReserveDate()).orElse(null));
            reservation.setSuspendUntil(Optional.ofNullable(rawHold.getSuspendUntil()).orElse(null));
            reservation.setPickupNumber(Optional.ofNullable(rawHold.getPickupNumber()).orElse(null));
            circulationObject = reservation;
        }
        circulationObject.setId(rawHold.getId());
        circulationObject.setRecordId(rawHold.getRecordId());
        circulationObject.setBranchCode(rawHold.getBranchCode());

        return circulationObject;
    }


    private boolean convertBooleanString(String string) {
        boolean returnValue = true;
        if (string.equals("0") || string.equals("false")) {
            returnValue = false;
        }
        return returnValue;
    }

    private HoldsAndPickups getHolds(String borrowerId) throws Exception {
        HoldsAndPickups holdsAndPickups = new HoldsAndPickups();
        Type rawHoldsArrayType = new TypeToken<ArrayList<RawHold>>() {
        }.getType();
        List<RawHold> rawHolds = GSON.fromJson(kohaAdapter.getHolds(borrowerId), rawHoldsArrayType);
        List<Pickup> pickupsList = new ArrayList<>();
        List<Reservation> holdsList = new ArrayList<>();

        for (RawHold rawHold : rawHolds) {
            CirculationObject circulationObject = rawHoldToCirculationObject(rawHold);
            if (circulationObject instanceof Reservation) {
                holdsList.add((Reservation) circulationObject);
            } else {
                pickupsList.add((Pickup) circulationObject);
            }
            circulationObject.decorateWithPublicationData(getPublicationMetadataByRecordId(rawHold.getRecordId()));
        }
        holdsAndPickups.setHolds(holdsList);
        holdsAndPickups.setPickups(pickupsList);
        return holdsAndPickups;
    }

    private List<Loan> getLoans(String borrowerId) throws Exception {
        String checkouts = kohaAdapter.getCheckouts(borrowerId);
        RawLoan[] rawLoans = GSON.fromJson(checkouts, RawLoan[].class);
        List<Loan> loans = new ArrayList<>();
        for (RawLoan rawLoan : rawLoans) {
            Loan loan = new Loan();
            loan.setId(rawLoan.getId());
            loan.setItemNumber(rawLoan.getItemNumber());
            loan.setBranchCode(rawLoan.getBranchCode());
            loan.setBorrowerNumber(rawLoan.getBorrowerId());
            loan.setDueDate(rawLoan.getDueDate());
            loan.setItemNumber(rawLoan.getItemNumber());
            Record loanRecord = getRecordIdFromLoan(loan);
            String recordId = loanRecord.getId();
            loan.setRecordId(recordId);
            loan.decorateWithPublicationData(getPublicationMetadataByRecordId(recordId));
            if (loan.getTitle() == null) {
                loan.setTitle(Optional.of(loanRecord.getTitle()).orElse("No title/Uten tittel"));
            }
            loans.add(loan);
        }
        return loans;
    }

    private Record getRecordIdFromLoan(Loan loan) {
        String data = kohaAdapter.getBiblioFromItemNumber(loan.getItemNumber());
        return GSON.fromJson(data, Record.class);
    }


    private Map<String, String> getPublicationMetadataByRecordId(String recordId) {
        Map<String, String> publicationMetadata = new HashMap<>();
        repository.retrievePublicationDataByRecordId(recordId).forEachRemaining(querySolution -> {
            querySolution.varNames().forEachRemaining(varName -> {
                if (querySolution.get(varName).isLiteral()) {
                    publicationMetadata.put(varName, querySolution.get(varName).asLiteral().getString());
                } else {
                    publicationMetadata.put(varName, querySolution.get(varName).toString());
                }
            });
        });
        String title = publicationMetadata.get("mainTitle");
        if (publicationMetadata.get("subtitle") != null) {
            title += " : " + publicationMetadata.get("subtitle");
        }
        if (publicationMetadata.get("partNumber") != null) {
            title += ". " + publicationMetadata.get("partNumber");
        }
        if (publicationMetadata.get("partTitle") != null) {
            title += ". " + publicationMetadata.get("partTitle");
        }
        publicationMetadata.put("title", title);
        return publicationMetadata;
    }

    @Override
    public List<ResourceSummary> retrieveInverseRelations(XURI xuri, String predicate, List<String> projections) {
        Model related = repository.retrieveInverseRelations(xuri, predicate);
        final ResIterator subjects = related.listSubjects();
        List<ResourceSummary> retVal = newArrayList();
        subjects.forEachRemaining(s -> {
            if (!s.isAnon()) {
                retVal.add(new ResourceSummary(s.getURI(), projections
                        .stream()
                        .map(p -> Pair.of(p, related.getProperty(s, createProperty(ontology(), p))))
                        .filter(p -> p.getValue() != null)
                        .map(p -> Pair.of(p.getKey(), p.getValue().getObject().asLiteral().getString()))
                        .collect(toMap(Pair::getKey, Pair::getValue))));
            }
        });
        return retVal;
    }

    @Override
    public void deleteIncomingRelations(XURI xuri) {
        repository.deleteIncomingRelations(xuri);
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
        ofNullable(querySolution.getLiteral("isMainEntry")).ifPresent(relationship::setIsMainEntry);
        ofNullable(querySolution.getLiteral("isRole")).ifPresent(relationship::setIsRole);
        return relationship;
    }

    private XURI targetUri(QuerySolution querySolution) {
        try {
            final Resource targetUri = querySolution.getResource("targetUri");
            return targetUri != null ? new XURI(targetUri.getURI()) : null;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public void mergeResource(XURI xuri, XURI replaceeUri) {
        repository.mergeResource(xuri, replaceeUri);
    }

    private boolean isAboutRelevantType(Statement s, Model model, XURI xuri) {
        return model.contains(s.getSubject(), RDF.type, ResourceFactory.createResource(ontology(xuri.getTypeAsEntityType().getRdfType())));
    }

    private boolean isNameStatement(Statement s, String[] predicates) {
        return stream(predicates).anyMatch(p -> s.getPredicate().equals(ResourceFactory.createResource(p)));
    }

    @Override
    public RDFRepository getRepo() {
        return repository;
    }



}
