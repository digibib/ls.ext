package no.deichman.services.entity;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import no.deichman.services.entity.kohaadapter.KohaAdapter;
import no.deichman.services.entity.kohaadapter.KohaItem2Rdf;
import no.deichman.services.entity.kohaadapter.MarcConstants;
import no.deichman.services.entity.kohaadapter.MarcField;
import no.deichman.services.entity.kohaadapter.MarcRecord;
import no.deichman.services.entity.patch.PatchParserException;
import no.deichman.services.entity.repository.InMemoryRepository;
import no.deichman.services.rdf.RDFModelUtil;
import no.deichman.services.uridefaults.BaseURI;
import no.deichman.services.uridefaults.XURI;
import org.apache.commons.io.IOUtils;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.rdf.model.NodeIterator;
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
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;

import javax.ws.rs.BadRequestException;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;

import static com.google.common.collect.ImmutableMap.of;
import static com.google.common.collect.Lists.newArrayList;
import static java.lang.String.format;
import static no.deichman.services.entity.EntityType.CORPORATION;
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
import static org.hamcrest.Matchers.is;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static uk.co.datumedge.hamcrest.json.SameJSONAs.sameJSONAs;

@RunWith(MockitoJUnitRunner.class)
public class EntityServiceImplTest {

    private static final String A_BIBLIO_ID = "234567";
    public static final Property CREATED = ResourceFactory.createProperty("http://data.deichman.no/ontology#created");
    public static final Property MODIFIED = ResourceFactory.createProperty("http://data.deichman.no/ontology#modified");
    @Rule
    public ExpectedException thrown = ExpectedException.none();
    private EntityServiceImpl service;
    private InMemoryRepository repository;
    private String ontologyURI;
    private String workURI;
    private String publicationURI;
    private String personURI;
    private String placeURI;
    private String corporationURI;
    private String serialURI;
    private String workSeriesURI;
    private String subjectURI;
    private String genreURI;
    private String instrumentURI;
    private String compositionTypeURI;
    private String baseURI;
    private String eventURI;

    @Mock
    private KohaAdapter mockKohaAdapter;

    static Model modelForBiblio() throws IOException {
        Model model = ModelFactory.createDefaultModel();
        String in = IOUtils.toString(
                EntityServiceImplTest.class.getClassLoader().getResourceAsStream("biblio_expanded.json"),
                "UTF-8"
        );
        JsonObject json = new Gson().fromJson(in, JsonObject.class);
        KohaItem2Rdf m2r = new KohaItem2Rdf(

        );
        Model m = m2r.mapItemsToModel(json.getAsJsonArray("items"));

        model.add(m);
        return model;
    }

    @Before
    public void setup() {
        repository = new InMemoryRepository();
        service = new EntityServiceImpl(repository, mockKohaAdapter);
        baseURI = BaseURI.root();
        ontologyURI = BaseURI.ontology();
        workURI = BaseURI.work();
        publicationURI = BaseURI.publication();
        personURI = BaseURI.person();
        placeURI = BaseURI.place();
        corporationURI = BaseURI.corporation();
        serialURI = BaseURI.serial();
        workSeriesURI = BaseURI.workSeries();
        subjectURI = BaseURI.subject();
        genreURI = BaseURI.genre();
        instrumentURI = BaseURI.instrument();
        compositionTypeURI = BaseURI.compositionType();
        eventURI = BaseURI.event();
    }

    @Test
    public void test_retrieving_by_id() throws Exception {
        when(mockKohaAdapter.createNewBiblioWithMarcRecord(new MarcRecord())).thenReturn(A_BIBLIO_ID);
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
            toBeTested.removeAll(null, CREATED, null);
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
                + "        \"deichman:format\": \"http://data.deichman.no/format#CardGame\"\n"
                + "    }\n"
                + "}";
        Model inputModel = modelFrom(workData, JSONLD);
        String workId = service.create(WORK, inputModel);
        XURI xuri = new XURI(workId);
        Model test = service.retrieveWorkWithLinkedResources(xuri);
        assertTrue(
                test.contains(
                        createStatement(
                                createResource("http://data.deichman.no/format#CardGame"),
                                createProperty(RDFS.label.getURI()),
                                createLangLiteral("Kortspill", "no")
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
    public void test_retrieve_corporation_by_id_with_nationality() throws Exception {
        String testId = "test_retrieve_corporation_by_id_with_nationality";
        String corporationData = "{\n"
                + "    \"@context\": {\n"
                + "        \"rdfs\": \"http://www.w3.org/2000/01/rdf-schema#\",\n"
                + "        \"deichman\": \"http://deichman.no/ontology#\"\n"
                + "    },\n"
                + "    \"@graph\": {\n"
                + "        \"@id\": \"http://deichman.no/corporation/" + testId + "\",\n"
                + "        \"@type\": \"deichman:Corporation\"\n,"
                + "        \"deichman:nationality\":  { \"@id\": \"http://data.deichman.no/nationality#n\" } \n"
                + "    }\n"
                + "}";
        Model inputModel = modelFrom(corporationData, JSONLD);
        String corporationId = service.create(CORPORATION, inputModel);
        XURI xuri = new XURI(corporationId);
        Model test = service.retrieveCorporationWithLinkedResources(xuri);
        assertTrue(
                test.contains(
                        createStatement(
                                createResource("http://data.deichman.no/nationality#n"),
                                createProperty(RDFS.label.getURI()),
                                createLangLiteral("Norge", "no")
                        )
                )
        );
    }

    @Test
    public void test_retrieve_work_items_by_id() throws Exception {
        when(mockKohaAdapter.getBiblio("626460")).thenReturn(EntityServiceImplTest.modelForBiblio());
        EntityService myService = new EntityServiceImpl(repositoryWithDataFrom("testdata.ttl"), mockKohaAdapter);

        Model m = myService.retrieveWorkItemsByURI(new XURI("http://data.deichman.no/work/w0009112"));
        Property p = createProperty("http://data.deichman.no/ontology#editionOf");
        ResIterator ni = m.listSubjectsWithProperty(p);

        int i = 0;
        while (ni.hasNext()) {
            i++;
            ni.next();
        }
        final int expectedNoOfItems = 2;
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
        when(mockKohaAdapter.createNewBiblioWithMarcRecord(new MarcRecord())).thenReturn(A_BIBLIO_ID);
        String testId = "pSERVICE_PUBLICATION_SHOULD_EXIST";
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
        String testId = "hSERVICE_PERSON_SHOULD_EXIST";
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
        String testId = "pSERVICE_PLACE_SHOULD_EXIST";
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
    public void test_create_and_delete_entity() throws Exception {
        when(mockKohaAdapter.createNewBiblioWithMarcRecord(new MarcRecord())).thenReturn(A_BIBLIO_ID);
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
        data.removeAll(null, CREATED, null);
        assertTrue(oldModel.isIsomorphicWith(data));
        String patchData = getTestPatch("add", workUri.getUri(), "red");
        Model patchedModel = service.patch(workUri, patchData);
        assertTrue(patchedModel.contains(
                createResource(workUri.getUri()),
                createProperty(ontologyURI + "color"),
                "red"));
        assertNotNull(patchedModel.getProperty(CREATED.getURI()));
        patchData = getTestPatch("add", workUri.getUri(), "blue");
        patchedModel = service.patch(workUri, patchData);
        NodeIterator nodeIterator = patchedModel.listObjectsOfProperty(MODIFIED);
        final int[] count = new int[1];
        nodeIterator.forEachRemaining(rdfNode -> {
            count[0]++;
        });
        assertEquals(1, count[0]);
        assertNotNull(patchedModel.getProperty(MODIFIED.getURI()));
        patchedModel.removeAll(null, CREATED, null);
        patchedModel.removeAll(null, MODIFIED, null);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        RDFDataMgr.write(baos, patchedModel.difference(oldModel), Lang.NT);
        assertEquals(baos.toString("UTF-8").trim(),
                "<" + workUri.getUri() + "> <" + ontologyURI + "color> \"blue\" .\n"
                 +"<" + workUri.getUri() + "> <" + ontologyURI + "color> \"red\" .");
    }

    @Test
    public void test_patch_publication_add() throws Exception {
        when(mockKohaAdapter.createNewBiblioWithMarcRecord(new MarcRecord())).thenReturn(A_BIBLIO_ID);
        String testId = "publication_SHOULD_BE_PATCHABLE";
        String publicationData = getTestJSON(testId, "publication");
        Model inputModel = modelFrom(publicationData, JSONLD);
        XURI publicationId = new XURI(service.create(PUBLICATION, inputModel));
        String patchData = getTestPatch("add", publicationId.getUri(), "red");
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
        String testJSON = format(""
                + "{"
                + "  \"@graph\":["
                + "      {"
                + "        \"@id\":\"%s\","
                + "        \"name\": \"Work Name\""
                + "      },"
                + "      {"
                + "        \"@id\":\"%s\","
                + "        \"name\": \"Work Name\""
                + "      }, {\n"
                + "        \"@id\" : \"deichman-role:author\",\n"
                + "        \"@type\" : \"duo:Role\",\n"
                + "        \"label\" : [ {\n"
                + "          \"@language\" : \"en\",\n"
                + "          \"@value\" : \"Author\"\n"
                + "        }, {\n"
                + "          \"@language\" : \"no\",\n"
                + "          \"@value\" : \"Forfatter\"\n"
                + "        } ]\n"
                + "      },"
                + "      { \"@type\": \"deichman:Contribution\" },"
                + "      { \"@type\": \"deichman:Contribution\" },"
                + "      { \"@id\": \"%3$s\" }"
                + "    ]"
                + "}", workUri.getUri(), workUri2.getUri(), personUri.getUri());

        assertFalse(worksByCreator.isEmpty());
        assertThat("Got: " + stringFrom(worksByCreator, JSONLD), stringFrom(worksByCreator, JSONLD),
                sameJSONAs(testJSON)
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
        String recordId = "";

        switch (type.toLowerCase()) {
            case "work":
                resourceClass = "Work";
                resourceURI = workURI;
                break;
            case "publication":
                resourceClass = "Publication";
                resourceURI = publicationURI;
                recordId = "\"deichman:recordId\": \"" + A_BIBLIO_ID + "\",";
                break;
            case "person":
                resourceClass = "Person";
                resourceURI = personURI;
                break;
            case "place":
                resourceClass = "Place";
                resourceURI = placeURI;
                break;
            case "corporation":
                resourceClass = "Corporation";
                resourceURI = corporationURI;
                break;
            case "serial":
                resourceClass = "Serial";
                resourceURI = serialURI;
                break;
            case "workseries":
                resourceClass = "WorkSeries";
                resourceURI = workSeriesURI;
                break;
            case "subject":
                resourceClass = "Subject";
                resourceURI = subjectURI;
                break;
            case "genre":
                resourceClass = "Genre";
                resourceURI = genreURI;
                break;
            case "instrument":
                resourceClass = "Instrument";
                resourceURI = instrumentURI;
                break;
            case "compositiontype":
                resourceClass = "CompositionType";
                resourceURI = compositionTypeURI;
                break;
            case "event":
                resourceClass = "Event";
                resourceURI = eventURI;
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
                + recordId
                + "\"dcterms:identifier\":\"" + id + "\"}}", capitalize(type));
    }

    private String getTestPatch(String operation, String id, final String colour) {
        return "{"
                + "\"op\": \"" + operation + "\","
                + "\"s\": \"" + id + "\","
                + "\"p\": \"" + ontologyURI + "color\","
                + "\"o\": {"
                + "\"value\": \"" + colour + "\""
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

        when(mockKohaAdapter.createNewBiblioWithMarcRecord(getMarcRecord(originalMainTitle, null, partTitle, partNumber, isbn, publicationYear))).thenReturn(A_BIBLIO_ID);

        String publicationTriples = ""
                + "<http://host/publication/p1> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <" + ontologyURI + "Publication> .\n"
                + "<http://host/publication/p1> <" + ontologyURI + "mainTitle> \"" + originalMainTitle + "\" .\n"
                + "<http://host/publication/p1> <" + ontologyURI + "partTitle> \"" + partTitle + "\" .\n"
                + "<http://host/publication/p1> <" + ontologyURI + "partNumber> \"" + partNumber + "\" .\n"
                + "<http://host/publication/p1> <" + ontologyURI + "isbn> \"" + isbn + "\" .\n"
                + "<http://host/publication/p1> <" + ontologyURI + "publicationYear> \"" + publicationYear + "\" .\n";

        Model inputPublication = modelFrom(publicationTriples, Lang.NTRIPLES);
        XURI publicationUri = new XURI(service.create(PUBLICATION, inputPublication));

        service.patch(publicationUri, getPatch(publicationUri.getUri(), "mainTitle", originalMainTitle, newMainTitle));
        Model publicationModel = service.retrieveById(publicationUri);

        String recordId = publicationModel.getProperty(null, ResourceFactory.createProperty(ontologyURI + "recordId")).getString();
        verify(mockKohaAdapter).updateRecord(recordId, getMarcRecord(newMainTitle, null, partTitle, partNumber, isbn, publicationYear));
    }

    @Test
    public void should_throw_exception_if_posting_publication_with_nonexistant_work() throws Exception {
        thrown.expect(BadRequestException.class);
        thrown.expectMessage("Associated work does not exist.");
        String publicationTitle = "Sult";
        String publicationTriples = ""
                + "<http://host/publication/p1> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <" + ontologyURI + "Publication> .\n"
                + "<http://host/publication/p1> <" + ontologyURI + "mainTitle> \"" + publicationTitle + "\" .\n"
                + "<http://host/publication/p1> <" + ontologyURI + "publicationOf> <__WORKURI__> .\n";

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
        when(mockKohaAdapter.createNewBiblioWithMarcRecord(marcRecord)).thenReturn(A_BIBLIO_ID);

        String workTriples = ""
                + "<http://host/work/w1> <" + ontologyURI + "mainTitle> \"" + originalWorkTitle + "\" .\n"
                + "<http://host/work/w1> <" + ontologyURI + "publicationYear> \"2011\"^^<http://www.w3.org/2001/XMLSchema#gYear> ."
                + "<http://host/work/w1> <" + ontologyURI + "contributor> _:b0 .\n"
                + "_:b0 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <" + ontologyURI + "Contribution> .\n"
                + "_:b0 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <" + ontologyURI + "MainEntry> .\n"
                + "_:b0 <" + ontologyURI + "agent> <__CREATORURI__> .\n"
                + "_:b0 <" + ontologyURI + "role> <http://data.deichman.no/role#author> .\n";
        String publicationTriples = ""
                + "<http://host/publication/p1> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <" + ontologyURI + "Publication> .\n"
                + "<http://host/publication/p1> <" + ontologyURI + "mainTitle> \"" + originalPublicationTitle + "\" .\n"
                + "<http://host/publication/p1> <" + ontologyURI + "publicationOf> <__WORKURI__> .\n";
        String personTriples = ""
                + "<person> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <" + ontologyURI + "Person> .\n"
                + "<person> <" + ontologyURI + "name> \"" + originalCreator + "\" .";

        Model inputPerson = modelFrom(personTriples, Lang.NTRIPLES);
        XURI personUri = new XURI(service.create(PERSON, inputPerson));

        Model inputWork = modelFrom(workTriples.replace("__CREATORURI__", personUri.getUri()), Lang.NTRIPLES);
        XURI workUri = new XURI(service.create(WORK, inputWork));

        Model inputPublication = modelFrom(publicationTriples.replace("__WORKURI__", workUri.getUri()), Lang.NTRIPLES);
        XURI publicationUri = new XURI(service.create(PUBLICATION, inputPublication));
        verify(mockKohaAdapter).createNewBiblioWithMarcRecord(marcRecord);

        service.patch(publicationUri, getPatch(publicationUri.getUri(), "mainTitle", originalPublicationTitle, newPublicationTitle));
        Model publicationModel = service.retrieveById(publicationUri);

        String recordId = publicationModel.getProperty(null, ResourceFactory.createProperty(ontologyURI + "recordId")).getString();
        verify(mockKohaAdapter).updateRecord(recordId, getMarcRecord(newPublicationTitle, originalCreator));

        service.patch(workUri, getPatch(workUri.getUri(), "mainTitle", originalWorkTitle, newWorkTitle));
        verify(mockKohaAdapter, times(2)).updateRecord(recordId, getMarcRecord(newPublicationTitle, originalCreator)); // Need times(2) because publication has not changed.

        service.patch(personUri, getPatch(personUri.getUri(), "name", originalCreator, newCreator));
        verify(mockKohaAdapter).updateRecord(recordId, getMarcRecord(newPublicationTitle, newCreator));
    }

    @Test
    public void test_generate_full_marc_record_from_work_and_publication_info() throws Exception {
        String inputGraph = "@prefix ns1: <http://data.deichman.no/duo#> .\n"
                + "@prefix ns2: <http://data.deichman.no/ontology#> .\n"
                + "@prefix ns4: <http://data.deichman.no/raw#> .\n"
                + "@prefix ns5: <http://data.deichman.no/role#> .\n"
                + "@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .\n"
                + "@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .\n"
                + "@prefix xml: <http://www.w3.org/XML/1998/namespace> .\n"
                + "@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .\n"
                + "<http://data.deichman.no/publication/p735933031021> rdf:type ns2:Publication ;\n"
                + "    ns2:bibliofilPublicationID \"0626460\" ;\n"
                + "    ns2:format <http://data.deichman.no/format#EBokBib> ;\n"
                + "    ns2:hasMediaType <http://data.deichman.no/mediaType#Book> ;\n"
                + "    ns2:hasFormatAdaptation <http://data.deichman.no/formatAdaptation#largePrint> ;\n"
                + "    ns2:isbn \"82-495-0272-8\" ;\n"
                + "    ns2:language <http://lexvo.org/id/iso639-3/nob> ;\n"
                + "    ns2:mainTitle \"Berlinerpoplene\" ; ns2:partTitle \"deltittel\" ;\n"
                + "    ns2:publicationOf <http://data.deichman.no/work/w4e5db3a95caa282e5968f68866774e20> ;\n"
                + "    ns2:publicationYear \"2004\"^^xsd:gYear ;\n"
                + "    ns2:recordId \"11\" ;\n"
                + "    ns2:hasImage \"http://static.deichman.no/626460/kr/1_thumb.jpg\" ;\n"
                + "    ns2:hasHoldingBranch \"hutl\", \"fgry\" ;"
                + "    ns2:subtitle \"roman\" ;\n"
                + "    ns2:ageLimit \"75\" ;\n"
                + "    ns2:hasSummary \"abc\";\n"
                + "    ns2:hasPlaceOfPublication <http://deichman.no/place/p1> ;"
                + "    ns2:locationSignature \"Rag\" ;\n"
                + "    ns4:publicationHistory \"Forts. i: Eremittkrepsene\" ;\n"
                + "    ns4:statementOfResponsibility \"Anne Birkefeldt Ragde\" .\n"
                + "<http://data.deichman.no/work/w4e5db3a95caa282e5968f68866774e20> rdf:type ns2:Work ;\n"
                + "    ns2:audience <http://data.deichman.no/audience#adult> ;\n"
                + "    ns2:hasContentAdaptation <http://data.deichman.no/contentAdaptation#easyLanguage> ;\n"
                + "    ns2:contributor [ rdf:type ns2:Contribution,\n"
                + "                ns2:MainEntry ;\n"
                + "            ns2:agent <http://data.deichman.no/person/h10834700> ;\n"
                + "            ns2:role ns5:author ] ;\n"
                + "    ns2:language <http://lexvo.org/id/iso639-3/nob> ;\n"
                + "    ns2:fictionNonfiction <http://data.deichman.no/fictionNonfiction#fiction>\n ;"
                + "    ns2:literaryForm <http://data.deichman.no/literaryForm#novel> ;\n"
                + "    ns2:mainTitle \"Berlinerpoplene\" ;\n"
                + "    ns2:hasWorkType <http://data.deichman.no/workType#Literature> ;"
                + "    ns2:publicationYear \"2004\"^^xsd:gYear ;\n"
                + "    ns2:genre <http://deichman.no/genre/g1> ;"
                + "    ns2:subject <http://deichman.no/subject/e1200005>, <http://deichman.no/subject/e1200006> .\n"
                + "<http://data.deichman.no/person/h10834700> rdf:type ns2:Person ;\n"
                + "    ns2:birthYear \"1957\" ;\n"
                + "    ns2:name \"Ragde, Anne B.\" ;\n"
                + "    ns2:nationality <http://data.deichman.no/nationality#n> ;\n"
                + "    ns2:personTitle \"forfatter\" ;\n"
                + "    ns4:lifeSpan \"1957-\" ;\n"
                + "    ns1:bibliofilPersonId \"10834700\" .\n"
                + "<http://data.deichman.no/person/h11234> rdf:type ns2:Person ;\n"
                + "    ns2:name \"Falcinella, Cristina\" ;\n"
                + "    ns2:nationality <http://data.deichman.no/nationality#ita> .\n"
                + "<http://deichman.no/subject/e1200005> rdf:type ns2:Subject ;\n"
                + "    ns2:prefLabel \"Trondheim\" ;\n"
                + "    ns2:specification \"bartebyen\" ."
                + "<http://deichman.no/subject/e1200006> rdf:type ns2:Subject ;\n"
                + "    ns2:prefLabel \"Popler\" ."
                + "<http://deichman.no/genre/g1> rdf:type ns2:Genre ;\n"
                + "    ns2:prefLabel \"Krim\" ;\n"
                + "    ns2:specification \"spesial\" ."
                + "<http://deichman.no/place/p1> rdf:type ns2:Place ;\n"
                + "    ns2:prefLabel \"Oslo\" ."
                + "<http://data.deichman.no/literaryForm#novel> rdfs:label \"Roman\"@no, \"Novel\"@en .\n"
                + "<http://data.deichman.no/workType#Literature> rdfs:label \"Litteratur\"@no, \"Literature\"@en .\n"
                + "<http://data.deichman.no/mediaType#Book> rdfs:label \"Bok\"@no, \"Book\"@en .\n"
                + "<http://data.deichman.no/format#EBokBib> rdfs:label \"eBokBib\"@no, \"eBokBib\"@en .\n"
                + "<http://data.deichman.no/formatAdaptation#largePrint> rdfs:label \"Storskrift\"@no, \"Large print\"@en .\n"
                + "<http://data.deichman.no/contentAdaptation#easyLanguage> rdfs:label \"Lettlest, enkelt språk\"@no, \"Easy to read, easy language\"@en .\n"
                + "<http://data.deichman.no/audience#adult> rdfs:label \"Adult\"@en, \"Voksne\"@no .\n";
        Model model = RDFModelUtil.modelFrom(inputGraph, Lang.TURTLE);
        XURI pub = new XURI("http://data.deichman.no/publication/p735933031021");
        MarcRecord want = new MarcRecord();
        // fag/fiksjon:
        want.addControlField(MarcConstants.FIELD_008, MarcConstants.FIELD_008_FICTION);
        // Språk
        MarcField field = MarcRecord.newDataField("041");
        field.addSubfield('a', "nob");
        want.addMarcField(field);
        // Plasseringsinfo
        field = MarcRecord.newDataField("090");
        field.addSubfield('d', "Rag");
        want.addMarcField(field);
        // Hovedinnførsel:
        field = MarcRecord.newDataField("100");
        field.addSubfield('a', "Ragde, Anne B.");
        want.addMarcField(field);
        // Tittelopplysninger:
        field = MarcRecord.newDataField("245");
        field.addSubfield('a', "Berlinerpoplene");
        field.addSubfield('b', "roman");
        field.addSubfield('p', "deltittel");
        want.addMarcField(field);
        // ISBN:
        field = MarcRecord.newDataField("020");
        field.addSubfield('a', "82-495-0272-8");
        want.addMarcField(field);
        // Utgiverinfo:
        field = MarcRecord.newDataField("260");
        field.addSubfield('a', "Oslo");
        field.addSubfield('c', "2004");
        want.addMarcField(field);
        // Verkstype
        field = MarcRecord.newDataField("336");
        field.addSubfield('a', "Litteratur");
        want.addMarcField(field);
        // Medietype
        field = MarcRecord.newDataField("337");
        field.addSubfield('a', "Bok");
        want.addMarcField(field);
        // Tilrettelegging
        field = MarcRecord.newDataField("385");
        field.addSubfield('a', "Storskrift");
        want.addMarcField(field);
        field = MarcRecord.newDataField("385");
        field.addSubfield('a', "Lettlest, enkelt språk");
        want.addMarcField(field);
        // Målgruppe
        field = MarcRecord.newDataField("385");
        field.addSubfield('a', "Voksne");
        want.addMarcField(field);
        // Format
        field = MarcRecord.newDataField("338");
        field.addSubfield('a', "eBokBib");
        want.addMarcField(field);
        // Sammendrag
        field = MarcRecord.newDataField("520");
        field.addSubfield('a', "abc");
        want.addMarcField(field);
        // Sjanger:
        field = MarcRecord.newDataField("655");
        field.addSubfield('a', "Krim");
        want.addMarcField(field);
        // Literær form (som ikke er fag/fiksjon) som sjanger
        field = MarcRecord.newDataField("655");
        field.addSubfield('a', "Roman");
        want.addMarcField(field);
        // Emner:
        field = MarcRecord.newDataField("650");
        field.addSubfield('a', "Trondheim");
        field.addSubfield('q', "bartebyen");
        want.addMarcField(field);
        field = MarcRecord.newDataField("650");
        field.addSubfield('a', "Popler");
        want.addMarcField(field);
        // Aldersgrense:
        field = MarcRecord.newDataField("521");
        field.addSubfield('a', "Aldersgrense 75");
        want.addMarcField(field);
        MarcRecord got = service.generateMarcRecordForPublication(pub, model);
        assertTrue(got.equals(want));
    }

    @Test
    public void test_retrieves_work_ids() throws Exception {
        when(mockKohaAdapter.createNewBiblioWithMarcRecord(new MarcRecord())).thenReturn(A_BIBLIO_ID);

        Model model = modelFrom("<" + workURI + "> <http://www.w3.org/2000/01/rdf-schema#type> <" + ontologyURI + "Work> .", Lang.NTRIPLES);
        XURI xuri = new XURI(service.create(WORK, model));
        String testId = "publication_SHOULD_BE_PATCHABLE";
        String publicationData = getTestJSON(testId, "publication");
        String added = "<" + publicationURI + "p000> <" + ontologyURI + "publicationOf> <" + xuri.getUri() + "> .";
        Model inputModel = modelFrom(publicationData, JSONLD);
        inputModel.add(modelFrom(added, Lang.NTRIPLES));
        service.create(PUBLICATION, inputModel);

        List<String> result = service.retrieveWorkRecordIds(xuri);
        assertEquals(A_BIBLIO_ID, result.get(0));
    }

    @Test
    public void test_retrieve_by_inverse_retaion() throws Exception {
        final String workUri = "http://data.deichman.no/work/w4e5db3a95caa282e5968f68866774e20";
        final String publicationUri = "http://data.deichman.no/publication/p735933031021";
        String inputGraph = "@prefix ns1: <http://data.deichman.no/duo#> .\n"
                + "@prefix ns2: <http://data.deichman.no/ontology#> .\n"
                + "@prefix ns4: <http://data.deichman.no/raw#> .\n"
                + "@prefix ns5: <http://data.deichman.no/role#> .\n"
                + "@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .\n"
                + "@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .\n"
                + "@prefix xml: <http://www.w3.org/XML/1998/namespace> .\n"
                + "@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .\n"
                + "<" + publicationUri + "> rdf:type ns2:Publication ;\n"
                + "    ns2:bibliofilPublicationID \"0626460\" ;\n"
                + "    ns2:format <http://data.deichman.no/format#EBokBib> ;\n"
                + "    ns2:hasMediaType <http://data.deichman.no/mediaType#Book> ;\n"
                + "    ns2:hasFormatAdaptation <http://data.deichman.no/formatAdaptation#largePrint> ;\n"
                + "    ns2:isbn \"82-495-0272-8\" ;\n"
                + "    ns2:language <http://lexvo.org/id/iso639-3/nob> ;\n"
                + "    ns2:mainTitle \"Berlinerpoplene\" ; ns2:partTitle \"deltittel\" ;\n"
                + "    ns2:publicationOf <" + workUri + "> ;\n"
                + "    ns2:publicationYear \"2004\"^^xsd:gYear ;\n"
                + "    ns2:recordId \"11\" ;\n"
                + "    ns2:hasImage \"http://static.deichman.no/626460/kr/1_thumb.jpg\" ;\n"
                + "    ns2:hasHoldingBranch \"hutl\", \"fgry\" ;"
                + "    ns2:subtitle \"roman\" ;\n"
                + "    ns2:ageLimit \"75\" ;\n"
                + "    ns2:hasSummary \"abc\";\n"
                + "    ns2:hasPlaceOfPublication <http://deichman.no/place/p1> ;"
                + "    ns2:locationSignature \"Rag\" ;\n"
                + "    ns4:publicationHistory \"Forts. i: Eremittkrepsene\" ;\n"
                + "    ns4:statementOfResponsibility \"Anne Birkefeldt Ragde\" .\n"
                + "<" + workUri + "> rdf:type ns2:Work ;\n"
                + "    ns2:audience <http://data.deichman.no/audience#adult> ;\n"
                + "    ns2:hasContentAdaptation <http://data.deichman.no/contentAdaptation#easyLanguage> ;\n"
                + "    ns2:contributor [ rdf:type ns2:Contribution,\n"
                + "                ns2:MainEntry ;\n"
                + "            ns2:agent <http://data.deichman.no/person/h10834700> ;\n"
                + "            ns2:role ns5:author ] ;\n"
                + "    ns2:language <http://lexvo.org/id/iso639-3/nob> ;\n"
                + "    ns2:fictionNonfiction <http://data.deichman.no/fictionNonfiction#fiction>\n ;"
                + "    ns2:literaryForm <http://data.deichman.no/literaryForm#novel> ;\n"
                + "    ns2:mainTitle \"Berlinerpoplene\" ;\n"
                + "    ns2:hasWorkType <http://data.deichman.no/workType#Literature> ;"
                + "    ns2:publicationYear \"2004\"^^xsd:gYear ;\n"
                + "    ns2:genre <http://deichman.no/genre/g1> ;"
                + "    ns2:subject <http://deichman.no/subject/e1200005>, <http://deichman.no/subject/e1200006> .\n";
        Model model = RDFModelUtil.modelFrom(inputGraph, Lang.TURTLE);
        repository.addData(model);
        final List<ResourceSummary> resourceSummaries = service.retrieveInverseRelations(new XURI(workUri), "publicationOf", newArrayList("mainTitle", "subtitle", "ageLimit"));
        assertThat(resourceSummaries.size(), is(1));
        assertEquals(resourceSummaries.get(0), new ResourceSummary(publicationUri, of("mainTitle", "Berlinerpoplene", "subtitle", "roman", "ageLimit", "75")));
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
        MarcRecord marcRecord = new MarcRecord();
        if (name != null) {
            marcRecord.addMarcField(MarcConstants.FIELD_100, MarcConstants.SUBFIELD_A, name);
        }
        MarcField field = MarcRecord.newDataField(MarcConstants.FIELD_245);
        if (mainTitle != null) {
            field.addSubfield(MarcConstants.SUBFIELD_A, mainTitle);
        }
        if (partTitle != null) {
            field.addSubfield(MarcConstants.SUBFIELD_P, partTitle);
        }
        if (partNumber != null) {
            field.addSubfield(MarcConstants.SUBFIELD_N, partNumber);
        }
        if (field.size() > 0) {
            marcRecord.addMarcField(field);
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
