package no.deichman.services.entity;

import no.deichman.services.entity.kohaadapter.KohaAdapter;
import no.deichman.services.entity.kohaadapter.Marc2Rdf;
import no.deichman.services.entity.kohaadapter.MarcConstants;
import no.deichman.services.entity.kohaadapter.MarcField;
import no.deichman.services.entity.kohaadapter.MarcRecord;
import no.deichman.services.entity.patch.PatchParserException;
import no.deichman.services.entity.repository.InMemoryRepository;
import no.deichman.services.uridefaults.BaseURI;
import no.deichman.services.uridefaults.XURI;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.ResIterator;
import org.apache.jena.rdf.model.ResourceFactory;
import org.apache.jena.rdf.model.Statement;
import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFDataMgr;
import org.apache.jena.vocabulary.DCTerms;
import org.apache.jena.vocabulary.RDFS;
import org.apache.jena.vocabulary.XSD;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExpectedException;
import org.junit.runner.RunWith;
import org.marc4j.MarcReader;
import org.marc4j.MarcXmlReader;
import org.marc4j.marc.Record;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;

import javax.ws.rs.BadRequestException;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;


import static java.lang.String.format;
import static no.deichman.services.entity.EntityType.PERSON;
import static no.deichman.services.entity.EntityType.PLACE;
import static no.deichman.services.entity.EntityType.PUBLICATION;
import static no.deichman.services.entity.EntityType.WORK;
import static no.deichman.services.entity.repository.InMemoryRepositoryTest.repositoryWithDataFrom;
import static no.deichman.services.rdf.RDFModelUtil.modelFrom;
import static no.deichman.services.rdf.RDFModelUtil.stringFrom;
import static org.apache.commons.lang3.StringUtils.capitalize;
import static org.apache.jena.rdf.model.ResourceFactory.createLangLiteral;
import static org.apache.jena.rdf.model.ResourceFactory.createPlainLiteral;
import static org.apache.jena.rdf.model.ResourceFactory.createProperty;
import static org.apache.jena.rdf.model.ResourceFactory.createResource;
import static org.apache.jena.rdf.model.ResourceFactory.createStatement;
import static org.apache.jena.riot.Lang.JSONLD;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static uk.co.datumedge.hamcrest.json.SameJSONAs.sameJSONAs;

@RunWith(MockitoJUnitRunner.class)
public class EntityServiceImplTest {

    private static final String A_BIBLIO_ID = "234567";
    @Rule
    public ExpectedException thrown = ExpectedException.none();
    private EntityServiceImpl service;
    private InMemoryRepository repository;
    private String ontologyURI;
    private String workURI;
    private String publicationURI;
    private String personURI;
    private String placeURI;
    private String publisherURI;
    private String serialURI;
    private String subjectURI;
    private String genreURI;
    private String baseURI;

    @Mock
    private KohaAdapter mockKohaAdapter;

    static Model modelForBiblio() {
        Model model = ModelFactory.createDefaultModel();
        Model m = ModelFactory.createDefaultModel();
        InputStream in = EntityServiceImplTest.class.getClassLoader().getResourceAsStream("ragde.marcxml");
        MarcReader reader = new MarcXmlReader(in);
        Marc2Rdf marcRdf = new Marc2Rdf(BaseURI.local());
        while (reader.hasNext()) {
            Record record = reader.next();
            m.add(marcRdf.mapItemsToModel(record.getVariableFields(MarcConstants.FIELD_952)));
        }
        model.add(m);
        return model;
    }

    @Before
    public void setup() {
        BaseURI localBaseURI = BaseURI.local();
        repository = new InMemoryRepository();
        service = new EntityServiceImpl(localBaseURI, repository, mockKohaAdapter);
        baseURI = localBaseURI.getBaseUriRoot();
        ontologyURI = localBaseURI.ontology();
        workURI = localBaseURI.work();
        publicationURI = localBaseURI.publication();
        personURI = localBaseURI.person();
        placeURI = localBaseURI.place();
        publisherURI = localBaseURI.publisher();
        serialURI = localBaseURI.serial();
        subjectURI = localBaseURI.subject();
        genreURI = localBaseURI.genre();
    }

    @Test
    public void test_retrieving_by_id() throws Exception {
        when(mockKohaAdapter.getNewBiblioWithMarcRecord(new MarcRecord())).thenReturn(A_BIBLIO_ID);
        for (EntityType entityType : EntityType.values()) {
            String currentEntity = entityType.getPath();
            String entityId = currentEntity + "_should_Exist";
            String testDataURI = baseURI + currentEntity + "/" + entityId;
            String testJSON = getTestJSON(entityId, currentEntity);
            Model inputModel = modelFrom(testJSON, JSONLD);

            String servicesURI = service.create(entityType, inputModel);
            Model comparison = ModelFactory.createDefaultModel();
            InputStream in = new ByteArrayInputStream(testJSON.replace(testDataURI, servicesURI).
                    getBytes(StandardCharsets.UTF_8));
            RDFDataMgr.read(comparison, in, JSONLD);
            XURI xuri;
            xuri = new XURI(servicesURI);
            Model toBeTested = service.retrieveById(xuri);
            boolean value = toBeTested.isIsomorphicWith(comparison);
            assertTrue("Models were not isomorphic", value);
        }
    }

    @Test
    public void test_retrieve_work_by_id_with_language() throws Exception {
        String testId = "test_retrieve_work_by_id_with_language";
        String workData = "{\n"
                + "    \"@context\": {\n"
                + "        \"rdfs\": \"http://www.w3.org/2000/01/rdf-schema#\",\n"
                + "        \"deichman\": \"http://deichman.no/ontology#\"\n"
                + "    },\n"
                + "    \"@graph\": {\n"
                + "        \"@id\": \"http://deichman.no/publication/" + testId + "\",\n"
                + "        \"@type\": \"deichman:Work\"\n,"
                + "        \"deichman:language\": \"http://lexvo.org/id/iso639-3/eng\"\n"
                + "    }\n"
                + "}";
        Model inputModel = modelFrom(workData, JSONLD);
        String workId = service.create(WORK, inputModel);
        XURI xuri = new XURI(workId);
        Model test = service.retrieveWorkWithLinkedResources(xuri);
        assertTrue(
                test.contains(
                        createStatement(
                                createResource("http://lexvo.org/id/iso639-3/eng"),
                                createProperty(RDFS.label.getURI()),
                                createLangLiteral("Engelsk", "no")
                        )
                )
        );
    }

    @Test
    public void test_retrieve_work_by_id_with_format() throws Exception {
        String testId = "test_retrieve_work_by_id_with_format";
        String workData = "{\n"
                + "    \"@context\": {\n"
                + "        \"rdfs\": \"http://www.w3.org/2000/01/rdf-schema#\",\n"
                + "        \"deichman\": \"http://deichman.no/ontology#\"\n"
                + "    },\n"
                + "    \"@graph\": {\n"
                + "        \"@id\": \"http://deichman.no/publication/" + testId + "\",\n"
                + "        \"@type\": \"deichman:Work\"\n,"
                + "        \"deichman:format\": \"http://data.deichman.no/format#Book\"\n"
                + "    }\n"
                + "}";
        Model inputModel = modelFrom(workData, JSONLD);
        String workId = service.create(WORK, inputModel);
        XURI xuri = new XURI(workId);
        Model test = service.retrieveWorkWithLinkedResources(xuri);
        assertTrue(
                test.contains(
                        createStatement(
                                createResource("http://data.deichman.no/format#Book"),
                                createProperty(RDFS.label.getURI()),
                                createLangLiteral("Bok", "no")
                        )
                )
        );
    }

    @Test
    public void test_retrieve_person_by_id_with_nationality() throws Exception {
        String testId = "test_retrieve_person_by_id_with_nationality";
        String personData = "{\n"
                + "    \"@context\": {\n"
                + "        \"rdfs\": \"http://www.w3.org/2000/01/rdf-schema#\",\n"
                + "        \"deichman\": \"http://deichman.no/ontology#\"\n"
                + "    },\n"
                + "    \"@graph\": {\n"
                + "        \"@id\": \"http://deichman.no/person/" + testId + "\",\n"
                + "        \"@type\": \"deichman:Person\"\n,"
                + "        \"deichman:nationality\":  { \"@id\": \"http://data.deichman.no/nationality#eng\" } \n"
                + "    }\n"
                + "}";
        Model inputModel = modelFrom(personData, JSONLD);
        String personId = service.create(PERSON, inputModel);
        XURI xuri = new XURI(personId);
        Model test = service.retrievePersonWithLinkedResources(xuri);
        assertTrue(
                test.contains(
                        createStatement(
                                createResource("http://data.deichman.no/nationality#eng"),
                                createProperty(RDFS.label.getURI()),
                                createLangLiteral("England", "no")
                        )
                )
        );
    }

    @Test
    public void test_retrieve_work_items_by_id() throws Exception {
        when(mockKohaAdapter.getBiblio("626460")).thenReturn(EntityServiceImplTest.modelForBiblio());
        EntityService myService = new EntityServiceImpl(BaseURI.local(), repositoryWithDataFrom("testdata.ttl"), mockKohaAdapter);

        Model m = myService.retrieveWorkItemsByURI(new XURI("http://deichman.no/work/w0009112"));
        Property p = createProperty("http://deichman.no/ontology#editionOf");
        ResIterator ni = m.listSubjectsWithProperty(p);

        int i = 0;
        while (ni.hasNext()) {
            i++;
            ni.next();
        }
        final int expectedNoOfItems = 1;
        assertEquals(expectedNoOfItems, i);
    }

    @Test
    public void test_create_work() throws Exception {
        String testId = "SERVICE_WORK_SHOULD_EXIST";
        String work = getTestJSON(testId, "work");
        Model inputModel = modelFrom(work, JSONLD);

        final String uri = service.create(WORK, inputModel);

        Statement s = createStatement(
                createResource(uri),
                createProperty(DCTerms.identifier.getURI()),
                createPlainLiteral(testId));
        assertTrue(repository.askIfStatementExists(s));
    }

    @Test
    public void test_create_publication() throws Exception {
        when(mockKohaAdapter.getNewBiblioWithMarcRecord(new MarcRecord())).thenReturn(A_BIBLIO_ID);
        String testId = "SERVICE_PUBLICATION_SHOULD_EXIST";
        String publication = getTestJSON(testId, "publication");
        Model inputModel = modelFrom(publication, JSONLD);

        String publicationId = service.create(PUBLICATION, inputModel);

        Statement s = createStatement(
                createResource(publicationId),
                createProperty(DCTerms.identifier.getURI()),
                createPlainLiteral(testId));
        assertTrue(repository.askIfStatementExists(s));
    }

    @Test
    public void test_create_person() throws Exception {
        String testId = "SERVICE_PERSON_SHOULD_EXIST";
        String person = getTestJSON(testId, "person");
        Model inputModel = modelFrom(person, JSONLD);

        final String uri = service.create(PERSON, inputModel);

        Statement s = createStatement(
                createResource(uri),
                createProperty(DCTerms.identifier.getURI()),
                createPlainLiteral(testId));
        assertTrue(repository.askIfStatementExists(s));
    }

    @Test
    public void test_create_place() throws Exception {
        String testId = "SERVICE_PLACE_SHOULD_EXIST";
        String place = getTestJSON(testId, "place");
        Model inputModel = modelFrom(place, JSONLD);

        final String uri = service.create(PLACE, inputModel);

        Statement s = createStatement(
                createResource(uri),
                createProperty(DCTerms.identifier.getURI()),
                createPlainLiteral(testId));
        assertTrue(repository.askIfStatementExists(s));
    }

    @Test
    public void test_create_publication_with_items() throws Exception {
        MarcRecord marcRecord = new MarcRecord();
        String title = "Titely title";
        MarcField titleField = MarcRecord.newDataField(MarcConstants.FIELD_245);
        titleField.addSubfield('a', title);
        marcRecord.addMarcField(titleField);
        MarcField itemsField = MarcRecord.newDataField(MarcConstants.FIELD_952);
        itemsField.addSubfield('a', "hutl");
        itemsField.addSubfield('b', "hutl");
        itemsField.addSubfield('c', "m");
        itemsField.addSubfield('l', "3");
        itemsField.addSubfield('m', "1");
        itemsField.addSubfield('o', "952 Cri");
        itemsField.addSubfield('p', "213123123");
        itemsField.addSubfield('q', "2014-11-05");
        itemsField.addSubfield('t', "1");
        itemsField.addSubfield('y', "L");
        marcRecord.addMarcField(itemsField);
        when(mockKohaAdapter.getNewBiblioWithMarcRecord(marcRecord)).thenReturn("123");
        Model test = modelFrom(itemNTriples(title, "213123123").replaceAll("__BASEURI__", "http://deichman.no/"), Lang.NTRIPLES);
        String response = service.create(PUBLICATION, test);
        assertTrue(response.substring(response.lastIndexOf("/") + 1, response.length()).matches("p[0-9]+"));
    }

    @Test
    public void test_create_and_delete_entity() throws Exception {
        when(mockKohaAdapter.getNewBiblioWithMarcRecord(new MarcRecord())).thenReturn(A_BIBLIO_ID);
        String testId = "publication_SHOULD_BE_DELETED";
        String publication = getTestJSON(testId, "publication");
        Model inputModel = modelFrom(publication, JSONLD);
        String publicationId = service.create(PUBLICATION, inputModel);
        Statement s = createStatement(
                createResource(publicationId),
                createProperty(DCTerms.identifier.getURI()),
                createPlainLiteral(testId));
        assertTrue(repository.askIfStatementExists(s));

        Model test = ModelFactory.createDefaultModel();
        InputStream in = new ByteArrayInputStream(
                publication.replace(publicationURI + testId, publicationId)
                        .getBytes(StandardCharsets.UTF_8));
        RDFDataMgr.read(test, in, JSONLD);
        service.delete(test);
        assertFalse(repository.askIfStatementExists(s));
    }

    @Test
    public void test_patch_work_add() throws Exception {
        String testId = "work_SHOULD_BE_PATCHABLE";
        String workData = getTestJSON(testId, "work");
        Model inputModel = modelFrom(workData, JSONLD);
        XURI workUri = new XURI(service.create(WORK, inputModel));

        Model oldModel = ModelFactory.createDefaultModel();

        String comparisonRDF = workData.replace(workURI + testId, workUri.getUri());
        InputStream oldIn = new ByteArrayInputStream(comparisonRDF.getBytes(StandardCharsets.UTF_8));
        RDFDataMgr.read(oldModel, oldIn, JSONLD);
        Model data = service.retrieveById(workUri);
        assertTrue(oldModel.isIsomorphicWith(data));
        String patchData = getTestPatch("add", workUri.getUri());
        Model patchedModel = service.patch(workUri, patchData);
        assertTrue(patchedModel.contains(
                createResource(workUri.getUri()),
                createProperty(ontologyURI + "color"),
                "red"));
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        RDFDataMgr.write(baos, patchedModel.difference(oldModel), Lang.NT);
        assertEquals(baos.toString("UTF-8").trim(),
                "<" + workUri.getUri() + "> <" + ontologyURI + "color> \"red\" .");
    }

    @Test
    public void test_patch_publication_add() throws Exception {
        when(mockKohaAdapter.getNewBiblioWithMarcRecord(new MarcRecord())).thenReturn(A_BIBLIO_ID);
        String testId = "publication_SHOULD_BE_PATCHABLE";
        String publicationData = getTestJSON(testId, "publication");
        Model inputModel = modelFrom(publicationData, JSONLD);
        XURI publicationId = new XURI(service.create(PUBLICATION, inputModel));
        String patchData = getTestPatch("add", publicationId.getUri());
        Model patchedModel = service.patch(publicationId, patchData);
        assertTrue(patchedModel.contains(
                createResource(publicationId.getUri()),
                createProperty(ontologyURI + "color"),
                "red"));
    }

    @Test(expected = PatchParserException.class)
    public void test_bad_patch_fails() throws Exception {
        String workData = getTestJSON("SHOULD_FAIL", "work");
        Model inputModel = modelFrom(workData, JSONLD);
        XURI workId = new XURI(service.create(WORK, inputModel));
        String badPatchData = "{\"po\":\"cas\",\"s\":\"http://example.com/a\"}";
        service.patch(workId, badPatchData);
    }

    @Test
    public void test_retrieve_work_by_creator() throws Exception {
        String testId = "PERSON_THAT_SHOULD_HAVE_CREATED_WORK";
        String person = getTestJSON(testId, "person");
        Model personModel = modelFrom(person, JSONLD);

        final XURI personUri = new XURI(service.create(PERSON, personModel));

        String work = getTestJSON("workId", "work");
        Model workModel = modelFrom(work, JSONLD);
        final XURI workUri = new XURI(service.create(WORK, workModel));

        String work2 = getTestJSON("workId2", "work");
        Model workModel2 = modelFrom(work2, JSONLD);
        XURI workUri2 = new XURI(service.create(WORK, workModel2));

        addContributorToWorkPatch(personUri, workUri);
        addContributorToWorkPatch(personUri, workUri2);
        Model worksByCreator = service.retrieveWorksByCreator(personUri);
        assertFalse(worksByCreator.isEmpty());
        assertThat(stringFrom(worksByCreator, JSONLD),
                sameJSONAs(format(""
                        + "{"
                        + "  \"@graph\":["
                        + "      {"
                        + "        \"@id\":\"%s\","
                        + "        \"rdfs:name\": \"Work Name\""
                        + "      },"
                        + "      {"
                        + "        \"@id\":\"%s\","
                        + "        \"rdfs:name\": \"Work Name\""
                        + "      },"
                        + "      { \"@type\": \"deichman:Contribution\" },"
                        + "      { \"@type\": \"deichman:Contribution\" },"
                        + "      { \"@id\": \"%3$s\" }"
                        + "    ]"
                        + "}", workUri.getUri(), workUri2.getUri(), personUri.getUri()))
                        .allowingExtraUnexpectedFields()
                        .allowingAnyArrayOrdering());
    }

    private void addContributorToWorkPatch(XURI personUri, XURI workUri) throws Exception {
        service.patch(workUri, format("["
                + "{"
                + "  \"op\":\"add\",\n"
                + "  \"s\": \"%1$s\",\n"
                + "  \"p\":\"%2$scontributor\",\n"
                + "  \"o\": {\"value\": \"_:b0\", \"type\": \"%4$s\"}"
                + "},\n"
                + "{"
                + "  \"op\":\"add\",\n"
                + "  \"s\": \"_:b0\",\n"
                + "  \"p\":\"http://www.w3.org/1999/02/22-rdf-syntax-ns#type\",\n"
                + "  \"o\": {\"value\": \"%2$sContribution\", \"type\": \"%4$s\"}"
                + "},\n"
                + "{"
                + "  \"op\":\"add\",\n"
                + "  \"s\": \"_:b0\",\n"
                + "  \"p\":\"%2$sagent\",\n"
                + "  \"o\": {\"value\": \"%3$s\", \"type\": \"%4$s\"}"
                + "},\n"
                + "{"
                + "  \"op\":\"add\",\n"
                + "  \"s\": \"_:b0\",\n"
                + "  \"p\":\"%2$srole\",\n"
                + "  \"o\": {\"value\": \"http://data.deichman.no/role#author\", \"type\": \"%4$s\"}"
                + "}\n"
                + "]", workUri.getUri(), ontologyURI, personUri.getUri(), XSD.anyURI.getURI()));
    }

    private String getTestJSON(String id, String type) {
        String resourceClass = null;
        String resourceURI = null;
        String recordID = "";

        switch (type.toLowerCase()) {
            case "work":
                resourceClass = "Work";
                resourceURI = workURI;
                break;
            case "publication":
                resourceClass = "Publication";
                resourceURI = publicationURI;
                recordID = "\"deichman:recordID\": \"" + A_BIBLIO_ID + "\",";
                break;
            case "person":
                resourceClass = "Person";
                resourceURI = personURI;
                break;
            case "place":
                resourceClass = "Place";
                resourceURI = placeURI;
                break;
            case "publisher":
                resourceClass = "Publisher";
                resourceURI = publisherURI;
                break;
            case "serial":
                resourceClass = "Serial";
                resourceURI = serialURI;
                break;
            case "subject":
                resourceClass = "Subject";
                resourceURI = subjectURI;
                break;
            case "genre":
                resourceClass = "Genre";
                resourceURI = genreURI;
                break;
            default:
                break;
        }


        return format("{\"@context\": "
                + "{\"dcterms\": \"http://purl.org/dc/terms/\","
                + "\"deichman\": \"" + ontologyURI + "\","
                + "\"rdfs\": \"http://www.w3.org/2000/01/rdf-schema#\"},"
                + "\"@graph\": "
                + "{\"@id\": \"" + resourceURI + "" + id + "\","
                + "\"@type\": \"deichman:" + resourceClass + "\","
                + "\"rdfs:name\": \"%s Name\","
                + recordID
                + "\"dcterms:identifier\":\"" + id + "\"}}", capitalize(type));
    }

    private String getTestPatch(String operation, String id) {
        return "{"
                + "\"op\": \"" + operation + "\","
                + "\"s\": \"" + id + "\","
                + "\"p\": \"" + ontologyURI + "color\","
                + "\"o\": {"
                + "\"value\": \"red\""
                + "}"
                + "}";
    }

    private String itemNTriples(final String title, final String barcode) {
        return "<__BASEURI__bibliofilResource/1527411> <" + ontologyURI + "hasItem> <__BASEURI__bibliofilItem/x" + barcode + "> .\n"
                + "<__BASEURI__bibliofilResource/1527411> <" + ontologyURI + "mainTitle> \"" + title + "\".\n"
                + "<__BASEURI__bibliofilItem/x" + barcode + "> <" + ontologyURI + "itemSubfieldCode/a> \"hutl\" .\n"
                + "<__BASEURI__bibliofilItem/x" + barcode + "> <" + ontologyURI + "itemSubfieldCode/b> \"hutl\" .\n"
                + "<__BASEURI__bibliofilItem/x" + barcode + "> <" + ontologyURI + "itemSubfieldCode/c> \"m\" .\n"
                + "<__BASEURI__bibliofilItem/x" + barcode + "> <" + ontologyURI + "itemSubfieldCode/l> \"3\" .\n"
                + "<__BASEURI__bibliofilItem/x" + barcode + "> <" + ontologyURI + "itemSubfieldCode/m> \"1\" .\n"
                + "<__BASEURI__bibliofilItem/x" + barcode + "> <" + ontologyURI + "itemSubfieldCode/o> \"952 Cri\" .\n"
                + "<__BASEURI__bibliofilItem/x" + barcode + "> <" + ontologyURI + "itemSubfieldCode/p> \"" + barcode + "\" .\n"
                + "<__BASEURI__bibliofilItem/x" + barcode + "> <" + ontologyURI + "itemSubfieldCode/q> \"2014-11-05\" .\n"
                + "<__BASEURI__bibliofilItem/x" + barcode + "> <" + ontologyURI + "itemSubfieldCode/t> \"1\" .\n"
                + "<__BASEURI__bibliofilItem/x" + barcode + "> <" + ontologyURI + "itemSubfieldCode/y> \"L\" .";
    }


    @Test
    public void test_generate_marc_record_in_publication_without_work_patch() throws Exception {
        String originalMainTitle = "Sult";
        String newMainTitle = "Torst";
        String partTitle = "Svolten";
        String partNumber = "Part 1";
        String isbn = "978-3-16-148410-0";
        String publicationYear = "2016";

        when(mockKohaAdapter.getNewBiblioWithMarcRecord(getMarcRecord(originalMainTitle, null, partTitle, partNumber, isbn, publicationYear))).thenReturn(A_BIBLIO_ID);

        String publicationTriples = ""
                + "<publication> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <" + ontologyURI + "Publication> .\n"
                + "<publication> <" + ontologyURI + "mainTitle> \"" + originalMainTitle + "\" .\n"
                + "<publication> <" + ontologyURI + "partTitle> \"" + partTitle + "\" .\n"
                + "<publication> <" + ontologyURI + "partNumber> \"" + partNumber + "\" .\n"
                + "<publication> <" + ontologyURI + "isbn> \"" + isbn + "\" .\n"
                + "<publication> <" + ontologyURI + "publicationYear> \"" + publicationYear + "\" .\n";

        Model inputPublication = modelFrom(publicationTriples, Lang.NTRIPLES);
        XURI publicationUri = new XURI(service.create(PUBLICATION, inputPublication));

        service.patch(publicationUri, getPatch(publicationUri.getUri(), "mainTitle", originalMainTitle, newMainTitle));
        Model publicationModel = service.retrieveById(publicationUri);

        String recordId = publicationModel.getProperty(null, ResourceFactory.createProperty(ontologyURI + "recordID")).getString();
        verify(mockKohaAdapter).updateRecord(recordId, getMarcRecord(newMainTitle, null, partTitle, partNumber, isbn, publicationYear));
    }

    @Test
    public void should_throw_exception_if_posting_publication_with_nonexistant_work() throws Exception {
        thrown.expect(BadRequestException.class);
        thrown.expectMessage("Associated work does not exist.");
        String publicationTitle = "Sult";
        String publicationTriples = ""
                + "<publication> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <" + ontologyURI + "Publication> .\n"
                + "<publication> <" + ontologyURI + "mainTitle> \"" + publicationTitle + "\" .\n"
                + "<publication> <" + ontologyURI + "publicationOf> <__WORKURI__> .\n";

        Model inputPublication = modelFrom(publicationTriples.replace("__WORKURI__", workURI + "w1230002111"), Lang.NTRIPLES);
        service.create(PUBLICATION, inputPublication);
    }

    @Test
    public void test_generate_marc_record_in_publication_patch() throws Exception {
        String originalCreator = "Knut Hamsun";
        String newCreator = "Ellisiv Lindkvist";
        String originalWorkTitle = "Hunger";
        String newWorkTitle = "Thirst";
        String originalPublicationTitle = "Sult";
        String newPublicationTitle = "Torst";

        MarcRecord marcRecord = getMarcRecord(originalPublicationTitle, originalCreator);
        when(mockKohaAdapter.getNewBiblioWithMarcRecord(marcRecord)).thenReturn(A_BIBLIO_ID);

        String workTriples = ""
                + "<work> <" + ontologyURI + "mainTitle> \"" + originalWorkTitle + "\" .\n"
                + "<work> <" + ontologyURI + "publicationYear> \"2011\"^^<http://www.w3.org/2001/XMLSchema#gYear> ."
                + "<work> <" + ontologyURI + "contributor> _:b0 .\n"
                + "_:b0 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <" + ontologyURI + "Contribution> .\n"
                + "_:b0 <" + ontologyURI + "agent> <__CREATORURI__> .\n"
                + "_:b0 <" + ontologyURI + "role> <http://data.deichman.no/role#author> .\n";
        String publicationTriples = ""
                + "<publication> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <" + ontologyURI + "Publication> .\n"
                + "<publication> <" + ontologyURI + "mainTitle> \"" + originalPublicationTitle + "\" .\n"
                + "<publication> <" + ontologyURI + "publicationOf> <__WORKURI__> .\n";
        String personTriples = ""
                + "<person> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <" + ontologyURI + "Person> .\n"
                + "<person> <" + ontologyURI + "name> \"" + originalCreator + "\" .";

        Model inputPerson = modelFrom(personTriples, Lang.NTRIPLES);
        XURI personUri = new XURI(service.create(PERSON, inputPerson));

        Model inputWork = modelFrom(workTriples.replace("__CREATORURI__", personUri.getUri()), Lang.NTRIPLES);
        XURI workUri = new XURI(service.create(WORK, inputWork));

        Model inputPublication = modelFrom(publicationTriples.replace("__WORKURI__", workUri.getUri()), Lang.NTRIPLES);
        XURI publicationUri = new XURI(service.create(PUBLICATION, inputPublication));
        verify(mockKohaAdapter).getNewBiblioWithMarcRecord(marcRecord);

        service.patch(publicationUri, getPatch(publicationUri.getUri(), "mainTitle", originalPublicationTitle, newPublicationTitle));
        Model publicationModel = service.retrieveById(publicationUri);

        String recordId = publicationModel.getProperty(null, ResourceFactory.createProperty(ontologyURI + "recordID")).getString();
        verify(mockKohaAdapter).updateRecord(recordId, getMarcRecord(newPublicationTitle, originalCreator));

        service.patch(workUri, getPatch(workUri.getUri(), "mainTitle", originalWorkTitle, newWorkTitle));
        verify(mockKohaAdapter, times(2)).updateRecord(recordId, getMarcRecord(newPublicationTitle, originalCreator)); // Need times(2) because publication has not changed.

        service.patch(personUri, getPatch(personUri.getUri(), "name", originalCreator, newCreator));
        verify(mockKohaAdapter).updateRecord(recordId, getMarcRecord(newPublicationTitle, newCreator));
    }

    private MarcRecord getMarcRecord(String mainTitle, String name) {
        MarcRecord marcRecord = new MarcRecord();
        if (mainTitle != null) {
            marcRecord.addMarcField(MarcConstants.FIELD_245, MarcConstants.SUBFIELD_A, mainTitle);
        }
        if (name != null) {
            marcRecord.addMarcField(MarcConstants.FIELD_100, MarcConstants.SUBFIELD_A, name);
        }
        return marcRecord;
    }


    private MarcRecord getMarcRecord(String mainTitle, String name, String partTitle, String partNumber, String isbn, String publicationYear) {
        MarcRecord marcRecord = getMarcRecord(mainTitle, name);
        if (partTitle != null) {
            marcRecord.addMarcField(MarcConstants.FIELD_245, MarcConstants.SUBFIELD_P, partTitle);
        }
        if (partNumber != null) {
            marcRecord.addMarcField(MarcConstants.FIELD_245, MarcConstants.SUBFIELD_N, partNumber);
        }
        if (isbn != null) {
            marcRecord.addMarcField(MarcConstants.FIELD_020, MarcConstants.SUBFIELD_A, isbn);
        }
        if (publicationYear != null) {
            marcRecord.addMarcField(MarcConstants.FIELD_260, MarcConstants.SUBFIELD_C, publicationYear);
        }
        return marcRecord;
    }


    private String getPatch(String uri, String field, String from, String to) {
        return "[{\"op\":\"del\",\"s\":\"" + uri + "\",\"p\":\"" + ontologyURI + "" + field + "\",\"o\":{\"value\":\"" + from + "\",\"type\":\"http://www.w3.org/2001/XMLSchema#string\"}},"
                + "{\"op\":\"add\",\"s\":\"" + uri + "\",\"p\":\"" + ontologyURI + "" + field + "\",\"o\":{\"value\":\"" + to + "\",\"type\":\"http://www.w3.org/2001/XMLSchema#string\"}}]";
    }

}
