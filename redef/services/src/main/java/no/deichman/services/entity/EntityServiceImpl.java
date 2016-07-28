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
    private final Property mainTitleProperty;
    private final Property publicationOfProperty;
    private final Property recordIdProperty;
    private final Property partTitleProperty;
    private final Property partNumberProperty;
    private final Property isbnProperty;
    private final Property publicationYearProperty;
    private final Property subtitleProperty;
    private final Property ageLimitProperty;



    public EntityServiceImpl(BaseURI baseURI, RDFRepository repository, KohaAdapter kohaAdapter) {
        this.baseURI = baseURI;
        this.repository = repository;
        this.kohaAdapter = kohaAdapter;
        mainTitleProperty = ResourceFactory.createProperty(baseURI.ontology("mainTitle"));
        publicationOfProperty = ResourceFactory.createProperty(baseURI.ontology("publicationOf"));
        recordIdProperty = ResourceFactory.createProperty(baseURI.ontology("recordID"));
        partTitleProperty = ResourceFactory.createProperty(baseURI.ontology("partTitle"));
        partNumberProperty = ResourceFactory.createProperty(baseURI.ontology("partNumber"));
        isbnProperty = ResourceFactory.createProperty(baseURI.ontology("isbn"));
        publicationYearProperty = ResourceFactory.createProperty(baseURI.ontology("publicationYear"));
        subtitleProperty = ResourceFactory.createProperty(baseURI.ontology("subtitle"));
        ageLimitProperty = ResourceFactory.createProperty(baseURI.ontology("ageLimit"));
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

        if (inputModel.contains(null, publicationOfProperty)) {
            Model work = repository.retrieveWorkAndLinkedResourcesByURI(new XURI(inputModel.getProperty(null, publicationOfProperty).getObject().toString()));
            if (work.isEmpty()) {
                throw new BadRequestException("Associated work does not exist.");
            }
            inputModel.add(work);
        }

        MarcRecord marcRecord = generateMarcRecordForPublication(null, inputModel);
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
        repository.patch(PatchParser.parse(ldPatchJson));

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
                    updatePublicationsByWork(resXuri, work);
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        } else if (xuri.getTypeAsEntityType().equals(EntityType.WORK)) {
            model = retrieveWorkWithLinkedResources(xuri);
            updatePublicationsByWork(xuri, model);
        } else if (xuri.getTypeAsEntityType().equals(EntityType.PUBLICATION)) {
            model = retrieveById(xuri);
            if (model.getProperty(null, publicationOfProperty) != null) {
                XURI workXURI = new XURI(model.getProperty(null, publicationOfProperty).getObject().toString());
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
        Model work = repository.retrieveWorkAndLinkedResourcesByURI(workXURI);
        updatePublicationInKoha(publication, work);
    }

    private void updatePublicationsByWork(XURI xuri, Model work)  {
        Model publications = repository.retrievePublicationsByWork(xuri);

        streamFrom(publications.listStatements())
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

        // Extract information from work:

        String mainEntryName = getMainEntryName(work);

        if (mainEntryName != null) {
            marcRecord.addMarcField(MarcConstants.FIELD_100, MarcConstants.SUBFIELD_A, mainEntryName);
        }

        List<String> genres = getGenres(work);
        if (!genres.isEmpty()) {
            for (String genre : genres) {
                marcRecord.addMarcField(MarcConstants.FIELD_655, MarcConstants.SUBFIELD_A, genre);
            }
        }

        List<String> subjects = getSubjects(work);
        if (!subjects.isEmpty()) {
            for (String subject : subjects) {
                marcRecord.addMarcField(MarcConstants.FIELD_690, MarcConstants.SUBFIELD_A, subject);
            }
        }

        if (work.getProperty(null, publicationOfProperty) != null) {
            // We have now extracted all information from work, and remove work triples from model,
            // in order not to fetch eg. work.mainTitle when fetching literals below.
            work.removeAll(work.getProperty(null, publicationOfProperty).getObject().asResource(), null, null);
        }


        Resource publicationResource = null; // default null if we are creating MARC record for a new publication without URI yet
        if (publication != null) {
            publicationResource = publication.getAsResource();
        }


        // Extract information from publication literals:

        MarcField field = MarcRecord.newDataField(MarcConstants.FIELD_245);
        if (work.getProperty(publicationResource, mainTitleProperty) != null) {
            field.addSubfield(MarcConstants.SUBFIELD_A,
                    work.getProperty(publicationResource, mainTitleProperty).getLiteral().getString());
        }
        if (work.getProperty(publicationResource, subtitleProperty) != null) {
            field.addSubfield(MarcConstants.SUBFIELD_B,
                    work.getProperty(publicationResource, subtitleProperty).getLiteral().getString());
        }
        if (work.getProperty(publicationResource, partTitleProperty) != null) {
            field.addSubfield(MarcConstants.SUBFIELD_P,
                    work.getProperty(publicationResource, partTitleProperty).getLiteral().getString());
        }
        if (work.getProperty(publicationResource, partNumberProperty) != null) {
            field.addSubfield(MarcConstants.SUBFIELD_N,
                    work.getProperty(publicationResource, partNumberProperty).getLiteral().getString());
        }
        if (field.size() > 0) {
            marcRecord.addMarcField(field);
        }
        if (work.getProperty(publicationResource, isbnProperty) != null) {
            marcRecord.addMarcField(MarcConstants.FIELD_020, MarcConstants.SUBFIELD_A,
                    work.getProperty(publicationResource, isbnProperty).getLiteral().getString());
        }
        if (work.getProperty(publicationResource, publicationYearProperty) != null) {
            marcRecord.addMarcField(MarcConstants.FIELD_260, MarcConstants.SUBFIELD_C,
                    work.getProperty(publicationResource, publicationYearProperty).getLiteral().getString());
        }
        if (work.getProperty(publicationResource, ageLimitProperty) != null) {
            marcRecord.addMarcField(MarcConstants.FIELD_019, MarcConstants.SUBFIELD_C,
                    work.getProperty(publicationResource, ageLimitProperty).getLiteral().getString());
        }


        return marcRecord;
    }


    private String getMainEntryName(Model work) {
        String mainEntryName = null;

        Query query = new SPARQLQueryBuilder(baseURI).getMainEntryName();
        try(QueryExecution qexec = QueryExecutionFactory.create(query, work)) {
            ResultSet results = qexec.execSelect();
            if (results.hasNext()) {
                QuerySolution soln = results.nextSolution();
                mainEntryName = soln.getLiteral("name").asLiteral().toString();
            }
        }
        return mainEntryName;
    }

    private List<String> getGenres(Model work) {
        List<String> genres = new ArrayList<>();
        Query query = new SPARQLQueryBuilder(baseURI).getGenreLabels();
        try(QueryExecution qexec = QueryExecutionFactory.create(query, work)) {
            ResultSet results = qexec.execSelect();
            while (results.hasNext()) {
                QuerySolution soln = results.nextSolution();
                genres.add(soln.getLiteral("genreLabel").asLiteral().toString());
            }
        }
        return genres;
    }

    private List<String> getSubjects(Model work) {
        List<String> subjects = new ArrayList<>();
        Query query = new SPARQLQueryBuilder(baseURI).getSubjectLabels();
        try(QueryExecution qexec = QueryExecutionFactory.create(query, work)) {
            ResultSet results = qexec.execSelect();
            while (results.hasNext()) {
                QuerySolution soln = results.nextSolution();
                subjects.add(soln.getLiteral("subjectLabel").asLiteral().toString());
            }
        }
        return subjects;
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
