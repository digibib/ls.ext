package no.deichman.services.entity;

import no.deichman.services.entity.kohaadapter.KohaAdapter;
import no.deichman.services.entity.kohaadapter.MarcRecord;
import no.deichman.services.entity.repository.InMemoryRepository;
import no.deichman.services.ontology.OntologyService;
import no.deichman.services.rdf.RDFModelUtil;
import no.deichman.services.search.SearchService;
import no.deichman.services.uridefaults.BaseURI;
import no.deichman.services.uridefaults.XURI;
import no.deichman.services.utils.ResourceReader;
import org.apache.commons.lang.WordUtils;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.rdf.model.ResourceFactory;
import org.apache.jena.rdf.model.SimpleSelector;
import org.apache.jena.rdf.model.Statement;
import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFDataMgr;
import org.apache.jena.riot.RDFLanguages;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

import javax.ws.rs.BadRequestException;
import javax.ws.rs.NotFoundException;
import javax.ws.rs.core.Response;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

import static com.google.common.collect.Lists.newArrayList;
import static javax.ws.rs.core.Response.Status.ACCEPTED;
import static javax.ws.rs.core.Response.Status.CONFLICT;
import static javax.ws.rs.core.Response.Status.CREATED;
import static javax.ws.rs.core.Response.Status.NOT_FOUND;
import static javax.ws.rs.core.Response.Status.NO_CONTENT;
import static javax.ws.rs.core.Response.Status.OK;
import static no.deichman.services.entity.EntityServiceImplTest.modelForBiblio;
import static no.deichman.services.entity.EntityType.SUBJECT;
import static no.deichman.services.entity.repository.InMemoryRepositoryTest.repositoryWithDataFrom;
import static no.deichman.services.entity.repository.InMemoryRepositoryTest.repositoryWithDataFromString;
import static no.deichman.services.rdf.RDFModelUtil.modelFrom;
import static no.deichman.services.testutil.TestJSON.assertValidJSON;
import static org.apache.jena.query.QueryExecutionFactory.create;
import static org.hamcrest.core.Is.is;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;
import static org.mockito.Matchers.any;
import static org.mockito.Matchers.anyString;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;

@RunWith(MockitoJUnitRunner.class)
public class EntityResourceTest {

    private static final String SOME_WORK_IDENTIFIER = "w123";
    private static final String SOME_PERSON_IDENTIFIER = "h123";
    private static final String SOME_PLACE_IDENTIFIER = "p123";
    private static final String WORK = "work";
    private static final String PERSON = "person";
    private static final String PLACE = "place";
    private static final String PUBLICATION = "publication";
    private static final String A_BIBLIO_ID = "1234";
    private static final String LOCATION = "Location";
    private EntityResource entityResource;

    @Mock
    private KohaAdapter mockKohaAdapter;

    @Mock
    private SearchService mockSearchService;

    @Mock
    private OntologyService mockOntologyService;

    @Before
    public void setUp() throws Exception {
        RDFLanguages.init();
        EntityServiceImpl service = new EntityServiceImpl(new InMemoryRepository(), mockKohaAdapter);
        entityResource = new EntityResource(service, mockSearchService, mockKohaAdapter);
    }

    @Test
    public void should_have_default_constructor() {
        assertNotNull(new EntityResource());
    }

    @Test
    public void get_should_return_a_valid_json_work() throws Exception {
        entityResource = new EntityResource(new EntityServiceImpl(repositoryWithDataFrom("testdata.ttl"), null), mockSearchService, mockKohaAdapter);
        String workId = "w00001";

        Response result = entityResource.get(WORK, workId);

        assertNotNull(result);
        assertEquals(OK.getStatusCode(), result.getStatus());
        assertValidJSON(result.getEntity().toString());
    }

    @Test
    public void get_should_return_201_and_location_when_resource_created() throws Exception {
        when(mockKohaAdapter.createNewBiblioWithMarcRecord(any())).thenReturn(A_BIBLIO_ID);
        for (EntityType entityType : EntityType.values()) {
            String entity = entityType.getPath();
            Response result = entityResource.createFromLDJSON(entity, "{}");
            System.out.println("Testing 201 response for " + entity);
            assertNull(result.getEntity());
            assertEquals(CREATED.getStatusCode(), result.getStatus());
            assertTrue(result.getLocation().toString().contains(entity));
        }
    }

    @Test(expected = NotFoundException.class)
    public void get_should_throw_exception_when_work_is_not_found() throws Exception {
        String workId = "work_DOES_NOT_EXIST";
        entityResource.get(WORK, workId);
    }

    @Test
    public void create_duplicate_person_returns_409() throws Exception {
        String personId = "n019283";
        String person = createPersonImportRDF(SOME_PERSON_IDENTIFIER, PERSON, personId);
        Response result = entityResource.createFromLDJSON(PERSON, person);
        assertNull(result.getEntity());
        assertEquals(CREATED.getStatusCode(), result.getStatus());
        Response duplicate = entityResource.createFromLDJSON(PERSON, person);
        assertNotNull(duplicate.getEntity());
        assertEquals(CONFLICT.getStatusCode(), duplicate.getStatus());
    }

    @Test
    public void create_duplicate_place_returns_409() throws Exception {
        String id = "g019283";
        String place = createPlaceImportRDF(SOME_PLACE_IDENTIFIER, PLACE, id);
        Response result = entityResource.createFromLDJSON(PLACE, place);
        assertNull(result.getEntity());
        assertEquals(CREATED.getStatusCode(), result.getStatus());
        Response duplicate = entityResource.createFromLDJSON(PLACE, place);
        assertNotNull(duplicate.getEntity());
        assertEquals(CONFLICT.getStatusCode(), duplicate.getStatus());
    }

    @Test
    public void update_should_return_200_when_work_updated() throws Exception {
        String work = createTestRDF(SOME_WORK_IDENTIFIER, WORK);
        Response result = entityResource.update(WORK, work);

        assertNull(result.getEntity());
        assertEquals(OK.getStatusCode(), result.getStatus());
    }

    @Test
    public void create_should_return_the_new_work() throws Exception {
        String work = createTestRDF(SOME_WORK_IDENTIFIER, WORK);

        Response createResponse = entityResource.createFromLDJSON(WORK, work);

        String workId = createResponse.getHeaderString(LOCATION).replaceAll(BaseURI.work(), "");

        Response result = entityResource.get(WORK, workId);

        assertNotNull(result);
        assertEquals(CREATED.getStatusCode(), createResponse.getStatus());
        assertEquals(OK.getStatusCode(), result.getStatus());
        assertValidJSON(result.getEntity().toString());
    }

    @Test
    public void create_should_index_the_new_work() throws Exception {
        String work = createTestRDF(SOME_WORK_IDENTIFIER, WORK);

        Response createResponse = entityResource.createFromLDJSON(WORK, work);

        String workId = createResponse.getHeaderString(LOCATION).replaceAll(BaseURI.work(), "");


        Response result = entityResource.index(WORK, workId);

        assertNotNull(result);
        assertEquals(ACCEPTED.getStatusCode(), result.getStatus());
    }

    @Test
    public void create_should_index_the_new_person() throws Exception {
        String person = createTestRDF(SOME_PERSON_IDENTIFIER, PERSON);

        Response createResponse = entityResource.createFromLDJSON(PERSON, person);

        String personId = createResponse.getHeaderString(LOCATION).replaceAll(BaseURI.person(), "");

        Response result = entityResource.index(PERSON, personId);

        assertNotNull(result);
        assertEquals(ACCEPTED.getStatusCode(), result.getStatus());
    }

    @Test
    public void create_should_index_the_new_place() throws Exception {
        String place = createTestRDF(SOME_PLACE_IDENTIFIER, PLACE);

        Response createResponse = entityResource.createFromLDJSON(PLACE, place);

        String placeId = new XURI(createResponse.getHeaderString(LOCATION)).getId();

        Response result = entityResource.index(PLACE, placeId);

        assertNotNull(result);
        assertEquals(ACCEPTED.getStatusCode(), result.getStatus());
    }

    @Test
    public void create_should_index_the_new_subject() throws Exception {
        String subject = createTestRDF("s213123", SUBJECT.getPath());

        Response createResponse = entityResource.createFromLDJSON(SUBJECT.getPath(), subject);

        String subjectId = new XURI(createResponse.getHeaderString(LOCATION)).getId();

        Response result = entityResource.index(SUBJECT.getPath(), subjectId);

        assertNotNull(result);
        assertEquals(ACCEPTED.getStatusCode(), result.getStatus());
    }

    @Test
    public void get_work_items_should_return_list_of_items() throws Exception {
        when(mockKohaAdapter.getBiblio("626460")).thenReturn(modelForBiblio());

        entityResource = new EntityResource(new EntityServiceImpl(repositoryWithDataFrom("testdata.ttl"), mockKohaAdapter), mockSearchService, mockKohaAdapter);

        XURI xuri = new XURI("http://deichman.no/work/w0009112");

        Response result = entityResource.getWorkItems(xuri.getId(), xuri.getType());

        assertNotNull(result);
        assertEquals(OK.getStatusCode(), result.getStatus());
        assertValidJSON(result.getEntity().toString());
    }

    @Test
    public void get_creator_works_should_return_list_of_works() throws Exception {
        entityResource = new EntityResource(new EntityServiceImpl(repositoryWithDataFrom("testdata.ttl"), mockKohaAdapter), mockSearchService, mockKohaAdapter);

        XURI xuri = new XURI("http://data.deichman.no/person/h12321011");
        Response result = entityResource.getWorksByCreator(xuri.getType(), xuri.getId());

        assertNotNull(result);
        assertEquals(OK.getStatusCode(), result.getStatus());
        assertValidJSON(result.getEntity().toString());
    }

    @Test
    public void get_work_items_should_204_on_empty_items_list() throws Exception {
        Response result = entityResource.getWorkItems("w4544454", WORK);
        assertEquals(result.getStatus(), NO_CONTENT.getStatusCode());
    }

    @Test
    public void patch_with_invalid_data_should_return_status_400() throws Exception {
        String work = createTestRDF(SOME_WORK_IDENTIFIER, WORK);
        Response result = entityResource.createFromLDJSON(WORK, work);
        String workId = result.getLocation().getPath().substring(("/" + WORK + "/").length());
        String patchData = "{}";
        try {
            entityResource.patch(WORK, workId, patchData);
            fail("HTTP 400 Bad Request");
        } catch (BadRequestException bre) {
            assertEquals("HTTP 400 Bad Request", bre.getMessage());
        }
    }

    @Test(expected = NotFoundException.class)
    public void patch_on_a_non_existing_resource_should_return_404() throws Exception {
        entityResource.patch(WORK, "w0000000012131231", "{}");
    }

    @Test(expected = NotFoundException.class)
    public void delete__non_existing_work_should_raise_not_found_exception() throws Exception {
        entityResource.delete(WORK, "work_DOES_NOT_EXIST_AND_FAILS");
    }

    @Test
    @Ignore
    public void delete_existing_work_should_return_no_content() throws Exception {
        String work = createTestRDF(SOME_WORK_IDENTIFIER, WORK);
        Response createResponse = entityResource.createFromLDJSON(WORK, work);
        String workId = createResponse.getHeaderString(LOCATION).replaceAll(BaseURI.work(), "");
        Response response = entityResource.delete(WORK, workId);
        assertEquals(response.getStatus(), NO_CONTENT.getStatusCode());
    }


    @Test
    public void location_returned_from_create_should_return_the_new_publication() throws Exception {
        when(mockKohaAdapter.createNewBiblioWithMarcRecord(new MarcRecord())).thenReturn(A_BIBLIO_ID);
        Response createResponse = entityResource.createFromLDJSON(PUBLICATION, createTestRDF("publication_SHOULD_EXIST", PUBLICATION));

        String publicationId = createResponse.getHeaderString(LOCATION).replaceAll(BaseURI.publication(), "");

        Response result = entityResource.get(PUBLICATION, publicationId);

        assertNotNull(result);
        assertEquals(CREATED.getStatusCode(), createResponse.getStatus());
        assertEquals(OK.getStatusCode(), result.getStatus());
        assertTrue(result.getEntity().toString().contains("\"deichman:recordId\""));
        assertValidJSON(result.getEntity().toString());
    }

    @Ignore
    @Test
    public void delete_publication_should_return_no_content() throws Exception {
        entityResource = new EntityResource(new EntityServiceImpl(repositoryWithDataFrom("testdata.ttl"), mockKohaAdapter), mockSearchService, mockKohaAdapter);
        when(mockKohaAdapter.createNewBiblioWithMarcRecord(new MarcRecord())).thenReturn(A_BIBLIO_ID);
        doNothing().when(mockKohaAdapter).deleteBiblio(anyString());
        Response createResponse = entityResource.createFromLDJSON(PUBLICATION, createTestRDF("publication_SHOULD_BE_PATCHABLE", PUBLICATION));
        String publicationId = createResponse.getHeaderString(LOCATION).replaceAll(BaseURI.publication(), "");
        Response response = entityResource.delete(PUBLICATION, publicationId);
        assertEquals(NO_CONTENT.getStatusCode(), response.getStatus());
    }

    @Test
    public void patch_should_actually_persist_changes() throws Exception {
        when(mockKohaAdapter.createNewBiblioWithMarcRecord(new MarcRecord())).thenReturn(A_BIBLIO_ID);
        String publication = createTestRDF("p00001", PUBLICATION);
        Response result = entityResource.createFromLDJSON(PUBLICATION, publication);
        String publicationId = result.getLocation().getPath().substring("/publication/".length());
        String patchData = "{"
                + "\"op\": \"add\","
                + "\"s\": \"" + result.getLocation().toString() + "\","
                + "\"p\": \"http://deichman.no/ontology#color\","
                + "\"o\": {"
                + "\"value\": \"red\""
                + "}"
                + "}";
        Response patchResponse = entityResource.patch(PUBLICATION, publicationId, patchData);
        Model testModel = ModelFactory.createDefaultModel();
        String response = patchResponse.getEntity().toString();
        InputStream in = new ByteArrayInputStream(response.getBytes(StandardCharsets.UTF_8));
        RDFDataMgr.read(testModel, in, Lang.JSONLD);
        Statement s = ResourceFactory.createStatement(
                ResourceFactory.createResource(result.getLocation().toString()),
                ResourceFactory.createProperty("http://deichman.no/ontology#color"),
                ResourceFactory.createPlainLiteral("red"));
        assertTrue(testModel.contains(s));
    }

    @Test
    public void work_should_have_language_labels() throws Exception {
        String data = "<http://lexvo.org/id/iso639-3/eng> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://lexvo.org/ontology#Language> .\n"
                + "<http://lexvo.org/id/iso639-3/eng> <http://www.w3.org/2000/01/rdf-schema#label> \"Engelsk\"@no .\n"
                + "<http://lexvo.org/id/iso639-3/eng> <http://www.w3.org/2000/01/rdf-schema#label> \"English\"@en .";
        String work = "<http://deichman.no/work/work_should_have_language_labels> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://data.deichman.no/ontology#Work> . \n"
                    + "<http://deichman.no/work/work_should_have_language_labels> <http://data.deichman.no/ontology#language> <http://lexvo.org/id/iso639-3/eng> .";
        Response createResponse = entityResource.createFromNTriples(WORK, work);
        String workId = createResponse.getHeaderString(LOCATION).replaceAll(BaseURI.work(), "");
        InMemoryRepository repo = (InMemoryRepository) entityResource.getEntityService().getRepo();
        repo.addData(modelFrom(data, Lang.NTRIPLES));
        Response result = entityResource.get(WORK, workId);

        assertEquals(OK.getStatusCode(), result.getStatus());
        assertTrue(result.getEntity().toString().contains("English"));
        assertTrue(result.getEntity().toString().contains("Engelsk"));
    }

    @Test
    public void work_should_have_worktype_labels() throws Exception {
        String data = "<http://data.deichman.no/workType#Literature> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://data.deichman.no/utility#WorkType> .\n"
                + "<http://data.deichman.no/workType#Literature> <http://www.w3.org/2000/01/rdf-schema#label> \"Litteratur\"@no .\n"
                + "<http://data.deichman.no/workType#Literature> <http://www.w3.org/2000/01/rdf-schema#label> \"Literature\"@en .";
        String work = "<http://deichman.no/work/work_should_worktype_labels> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://data.deichman.no/ontology#Work> . \n"
                    + "<http://deichman.no/work/work_should_worktype_labels> <http://data.deichman.no/ontology#hasWorkType> <http://data.deichman.no/workType#Literature> .";

        Response createResponse = entityResource.createFromNTriples(WORK, work);
        String workId = createResponse.getHeaderString(LOCATION).replaceAll(BaseURI.work(), "");
        InMemoryRepository repo = (InMemoryRepository) entityResource.getEntityService().getRepo();
        repo.addData(modelFrom(data, Lang.NTRIPLES));
        Response result = entityResource.get(WORK, workId);

        assertEquals(OK.getStatusCode(), result.getStatus());
        assertTrue(result.getEntity().toString().contains("Litteratur"));
        assertTrue(result.getEntity().toString().contains("Literature"));
    }

    @Test
    public void should_return_created_response_from_ntriples_input() throws Exception {
        String ntriples = "<#> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://deichman.no/ontology#Work> .";
        Response createResponse = entityResource.createFromNTriples("work", ntriples);
        assertEquals(CREATED.getStatusCode(), createResponse.getStatus());
    }

    @Test
    public void should_return_location_from_ntriples_input() throws Exception {
        String ntriples = "<#> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://deichman.no/ontology#Work> .";
        Response createResponse = entityResource.createFromNTriples("work", ntriples);
        assertTrue(createResponse.getLocation().toString().contains("http://"));
    }

    @Test
    public void should_return_a_list_of_record_ids() throws Exception {
        entityResource = new EntityResource(new EntityServiceImpl(repositoryWithDataFrom("work_w87654.ttl"), mockKohaAdapter), mockSearchService, mockKohaAdapter);
        XURI xuri = new XURI("http://deichman.no/work/w87654");
        Response result = entityResource.getWorkRecordIds(xuri.getType(), xuri.getId());
        assertEquals("{\n"
                + "  \"recordIds\": [\n"
                + "    \"80001\",\n"
                + "    \"80002\"\n"
                + "  ]\n"
                + "}", result.getEntity());
    }

    @Test
    public void should_return_empty_recordId_list_when_no_publications() throws Exception {
        entityResource = new EntityResource(new EntityServiceImpl(repositoryWithDataFrom("work_w00000891.ttl"), mockKohaAdapter), mockSearchService, mockKohaAdapter);
        XURI xuri = new XURI("http://deichman.no/work/w87654");
        Response result = entityResource.getWorkRecordIds(xuri.getType(), xuri.getId());
        assertEquals("{\n"
                + "  \"recordIds\": []\n"
                + "}", result.getEntity());

    }

    private String createTestRDF(String identifier, String type) throws Exception {
        String ontologyClass = WordUtils.capitalize(type);
        return "{\n"
                + "    \"@graph\": {\n"
                + "        \"@id\": \"" + new XURI(BaseURI.root() + type + "/" + identifier) + "\",\n"
                + "        \"@type\": \"http://deichman.no/ontology#" + ontologyClass + "\",\n"
                + "        \"http://purl.org/dc/terms/identifier\": \"" + identifier + "\"\n"
                + "    }\n"
                + "}";
    }

    private String createPersonImportRDF(String identifier, String type, String personId) {
        String ontologyClass = WordUtils.capitalize(type);
        return "{\n"
                + "    \"@context\": {\n"
                + "        \"dcterms\": \"http://purl.org/dc/terms/\",\n"
                + "        \"deichman\": \"http://deichman.no/ontology#\"\n"
                + "    },\n"
                + "    \"@graph\": {\n"
                + "        \"@id\": \"http://deichman.no/" + type + "/" + identifier + "\",\n"
                + "        \"@type\": \"deichman:" + ontologyClass + "\",\n"
                + "        \"http://data.deichman.no/duo#bibliofilPersonId\": \"" + personId + "\"\n"
                + "    }\n"
                + "}";
    }

    private String createPlaceImportRDF(String identifier, String type, String placeId) {
        String ontologyClass = WordUtils.capitalize(type);
        return "{\n"
                + "    \"@context\": {\n"
                + "        \"dcterms\": \"http://purl.org/dc/terms/\",\n"
                + "        \"deichman\": \"http://deichman.no/ontology#\"\n"
                + "    },\n"
                + "    \"@graph\": {\n"
                + "        \"@id\": \"http://deichman.no/" + type + "/" + identifier + "\",\n"
                + "        \"@type\": \"deichman:" + ontologyClass + "\",\n"
                + "        \"http://data.deichman.no/duo#bibliofilPlaceId\": \"" + placeId + "\"\n"
                + "    }\n"
                + "}";
    }

    @Test
    public void should_return_number_of_references_from_other_resources() throws Exception {
        entityResource = new EntityResource(new EntityServiceImpl(repositoryWithDataFrom("work_w87654.ttl"), mockKohaAdapter), mockSearchService, mockKohaAdapter);
        XURI xuri = new XURI("http://deichman.no/work/w87654");
        Response result = entityResource.getNumberOfRelationsForResource(xuri.getType(), xuri.getId());
        assertEquals("{\n"
                + "  \"http://data.deichman.no/ontology#Publication\": 2\n"
                + "}", result.getEntity());
    }

    @Ignore
    @Test
    public void should_replace_one_node_with_another() throws Exception {
        String replacee = "http://data.deichman.no/person/h1";
        XURI replacement = new XURI("http://data.deichman.no/person/h2");
        String work1 = new ResourceReader().readFile("merging_work_1.ttl");
        String work2 = new ResourceReader().readFile("merging_work_2.ttl");
        String work3 = new ResourceReader().readFile("merging_work_3_autobiography.ttl");
        String person1 = new ResourceReader().readFile("merging_persons_replacee_person.ttl");
        String person2 = new ResourceReader().readFile("merging_persons_replacement_person.ttl");
        Model testData = RDFModelUtil.modelFrom(
                work1.replace("__REPLACE__", replacee), Lang.TURTLE).add(
                RDFModelUtil.modelFrom(work2.replace("__REPLACE__", replacement.getUri()), Lang.TURTLE)
        ).add(
                RDFModelUtil.modelFrom(work3.replace("__REPLACE__", replacee), Lang.TURTLE)
        ).add(
                RDFModelUtil.modelFrom(person1.replace("__REPLACE__", replacee), Lang.TURTLE)
        ).add(
                RDFModelUtil.modelFrom(person2.replace("__REPLACE__", replacement.getUri()), Lang.TURTLE)
        );


        final InMemoryRepository repo = new InMemoryRepository();
        repo.addData(testData);
        Model testModel = RDFModelUtil.modelFrom(
                work1.replace("__REPLACE__", replacement.getUri()), Lang.TURTLE).add(
                RDFModelUtil.modelFrom(work2.replace("__REPLACE__", replacement.getUri()), Lang.TURTLE)
        ).add(
                RDFModelUtil.modelFrom(work3.replace("__REPLACE__", replacement.getUri()), Lang.TURTLE)
        ).add(
                RDFModelUtil.modelFrom(person2.replace("__REPLACE__", replacement.getUri()), Lang.TURTLE)
        );

        entityResource = new EntityResource(new EntityServiceImpl(repo, null), mockSearchService, null);

        String body = "{\"replacee\": \"" + replacee + "\"}";

        Response result = entityResource.mergeNodes(replacement.getType(), replacement.getId(), body);
        assertEquals(NO_CONTENT.getStatusCode(), result.getStatus());
        assertTrue(repo.getModel().isIsomorphicWith(testModel));
        Mockito.verify(mockSearchService).delete(new XURI(replacee));
        Mockito.verify(mockSearchService).index(new XURI("http://data.deichman.no/work/w1"));
        Mockito.verify(mockSearchService).index(new XURI("http://data.deichman.no/work/w3"));
    }

    @Ignore
    @Test(expected = NotFoundException.class)
    public void should_delete_incoming_direct_references() throws Exception {
        entityResource = new EntityResource(new EntityServiceImpl(repositoryWithDataFrom("person_with_relations.ttl"), null), mockSearchService, mockKohaAdapter);
        final Response workWithPersonAsSubject = entityResource.get(EntityType.WORK.getPath(), "w3");
        final Model workWithPersonAsSubjectModel = RDFModelUtil.modelFrom(workWithPersonAsSubject.getEntity().toString(), Lang.JSONLD);
        final Model query = workWithPersonAsSubjectModel.query(new SimpleSelector(ResourceFactory.createResource("http://data.deichman.no/work/w3"), ResourceFactory.createProperty("http://data.deichman.no/ontology#subject"), (String) null));

        assertTrue(query.isIsomorphicWith(RDFModelUtil.modelFrom(
                "<http://data.deichman.no/work/w3> <http://data.deichman.no/ontology#subject> <http://data.deichman.no/person/p3>, <http://data.deichman.no/person/p2> .\n", Lang.TURTLE)));

        entityResource.delete(EntityType.PERSON.getPath(), "p2");

        final Response workWithPersonAsSubjectAfterDeletedP2 = entityResource.get(EntityType.WORK.getPath(), "w3");
        final Model workWithPersonAsSubjecModelAfterDeleteP2 = RDFModelUtil.modelFrom(workWithPersonAsSubjectAfterDeletedP2.getEntity().toString(), Lang.JSONLD);

        final Model queryAfterRemoveReferences = workWithPersonAsSubjecModelAfterDeleteP2.query(new SimpleSelector(ResourceFactory.createResource("http://data.deichman.no/work/w3"), ResourceFactory.createProperty("http://data.deichman.no/ontology#subject"), (String) null));
        assertTrue(queryAfterRemoveReferences.isIsomorphicWith(RDFModelUtil.modelFrom(
                "<http://data.deichman.no/work/w3> <http://data.deichman.no/ontology#subject> <http://data.deichman.no/person/p3> .\n", Lang.TURTLE)));
        entityResource.get("person", "p2");
    }

    @Ignore
    @Test(expected = NotFoundException.class)
    public void should_delete_incoming_references_via_blank_nodes() throws Exception {
        entityResource = new EntityResource(new EntityServiceImpl(repositoryWithDataFrom("person_with_relations.ttl"), null), mockSearchService, mockKohaAdapter);
        assertFalse(RDFModelUtil.modelFrom(entityResource.get("person", "p4").getEntity().toString(), Lang.JSONLD).isEmpty());
        final Response workWithPersonAsAuthor = entityResource.get(EntityType.WORK.getPath(), "w4");
        final Model workWithPersonAsAuthorModel = RDFModelUtil.modelFrom(workWithPersonAsAuthor.getEntity().toString(), Lang.JSONLD);
        Model query = create("describe <http://data.deichman.no/work/w4>", workWithPersonAsAuthorModel).execDescribe();

        assertTrue(query.isIsomorphicWith(RDFModelUtil.modelFrom(
                "@prefix deichman: <http://data.deichman.no/ontology#> .\n"
                        + "@prefix rdfs:  <http://www.w3.org/2000/01/rdf-schema#> .\n"
                        + "\n"
                        + "<http://data.deichman.no/work/w4>\n"
                        + "        a                     deichman:Work ;\n"
                        + "        deichman:contributor  [ a               deichman:Contribution , deichman:MainEntry ;\n"
                        + "                                deichman:agent  <http://data.deichman.no/person/p4> ;\n"
                        + "                                deichman:role   <http://data.deichman.no/role#author>\n"
                        + "                              ] ;\n"
                        + "        deichman:mainTitle    \"De kaller meg Benny Bankboks\" .", Lang.TURTLE)));

        entityResource.delete(EntityType.PERSON.getPath(), "p4");

        final Response workWithPersonAsAuthorAfterDeletedP4 = entityResource.get(EntityType.WORK.getPath(), "w4");
        final Model workWithPersonAsAuthorModelAfterDeleteP4 = RDFModelUtil.modelFrom(workWithPersonAsAuthorAfterDeletedP4.getEntity().toString(), Lang.JSONLD);

        final Model queryAfterRemoveReferences = create("describe <http://data.deichman.no/work/w4>", workWithPersonAsAuthorModelAfterDeleteP4).execDescribe();
        assertTrue(queryAfterRemoveReferences.isIsomorphicWith(RDFModelUtil.modelFrom(
                "@prefix deichman: <http://data.deichman.no/ontology#> .\n"
                        + "@prefix rdfs:  <http://www.w3.org/2000/01/rdf-schema#> .\n"
                        + "\n"
                        + "<http://data.deichman.no/work/w4>\n"
                        + "        a                   deichman:Work ;\n"
                        + "        deichman:mainTitle  \"De kaller meg Benny Bankboks\" .\n", Lang.TURTLE)));
        entityResource.get("person", "p4");
    }

    @Test(expected = NotFoundException.class)
    public void should_throw_bad_request_due_to_wrong_uri() throws Exception {
        String replacee = "http://data.deichman.no/person/h1";
        XURI replacement = new XURI("http://data.deichman.no/person/h2");
        entityResource = new EntityResource(new EntityServiceImpl(new InMemoryRepository(), null), mockSearchService, null);
        String body = "{\"replacee\": \"" + replacee + "\"}";
        Response result = entityResource.mergeNodes(replacement.getType(), replacement.getId(), body);
        assertEquals(NOT_FOUND.getStatusCode(), result.getStatus());
    }

    @Test(expected = BadRequestException.class)
    public void should_throw_bad_request_due_to_badly_formatted_request_body() throws Exception {
        String replacee = "http://data.deichman.no/person/h1";
        XURI replacement = new XURI("http://data.deichman.no/person/h2");
        String turtleData = new ResourceReader().readFile("merging_persons_replacement_person.ttl").replace("__REPLACE__", replacement.getUri());

        entityResource = new EntityResource(new EntityServiceImpl(repositoryWithDataFromString(turtleData, Lang.TURTLE), null), mockSearchService, null);
        String body = "{\"replacea\": \"" + replacee + "\"}";
        entityResource.mergeNodes(replacement.getType(), replacement.getId(), body);
    }

    @Test(expected = BadRequestException.class)
    public void should_throw_bad_request_due_to_badly_formatted_uri_in_request_body() throws Exception {
        String replacee = "http://data.deichman.no/person/h1";
        XURI replacement = new XURI("http://data.deichman.no/person/h2");
        String turtleData = new ResourceReader().readFile("merging_persons_replacee_person.ttl").replace("__REPLACE__", replacement.getUri());
        entityResource = new EntityResource(new EntityServiceImpl(repositoryWithDataFromString(turtleData, Lang.TURTLE), null), mockSearchService, null);
        String body = "{\"replacee\": \"\"}";
        entityResource.mergeNodes(replacement.getType(), replacement.getId(), body);
    }

    @Test
    public void should_return_relations_for_person() throws Exception {
        entityResource = new EntityResource(new EntityServiceImpl(repositoryWithDataFrom("person_with_relations.ttl"), mockKohaAdapter), mockSearchService, mockKohaAdapter);
        XURI xuri = new XURI("http://deichman.no/person/p1");
        Response result = entityResource.retriveResourceParticipations(xuri.getType(), xuri.getId());
        assertEquals("[\n"
                + "  {\n"
                + "    \"relationshipType\": \"http://data.deichman.no/ontology#subject\",\n"
                + "    \"relationships\": [\n"
                + "      {\n"
                + "        \"relationshipType\": \"http://data.deichman.no/ontology#subject\",\n"
                + "        \"mainTitle\": \"Much ado about nothing\",\n"
                + "        \"targetType\": \"Work\",\n"
                + "        \"targetUri\": \"http://data.deichman.no/work/w2\"\n"
                + "      }\n"
                + "    ]\n"
                + "  },\n"
                + "  {\n"
                + "    \"relationshipType\": \"http://data.deichman.no/role#illustrator\",\n"
                + "    \"relationships\": [\n"
                + "      {\n"
                + "        \"relationshipType\": \"http://data.deichman.no/role#illustrator\",\n"
                + "        \"mainTitle\": \"Much ado about nothing\",\n"
                + "        \"subtitle\": \"Hey nonny nonny\",\n"
                + "        \"targetType\": \"Publication\",\n"
                + "        \"targetUri\": \"http://data.deichman.no/publication/p80002\",\n"
                + "        \"isRole\": true\n"
                + "      }\n"
                + "    ]\n"
                + "  },\n"
                + "  {\n"
                + "    \"relationshipType\": \"http://data.deichman.no/role#author\",\n"
                + "    \"relationships\": [\n"
                + "      {\n"
                + "        \"relationshipType\": \"http://data.deichman.no/role#author\",\n"
                + "        \"mainTitle\": \"Much ado about nothing\",\n"
                + "        \"targetType\": \"Work\",\n"
                + "        \"targetUri\": \"http://data.deichman.no/work/w1\",\n"
                + "        \"isMainEntry\": true,\n"
                + "        \"isRole\": true\n"
                + "      }\n"
                + "    ]\n"
                + "  }\n"
                + "]", result.getEntity());
    }

    @Test
    public void should_return_related_to_work() throws Exception {
        entityResource = new EntityResource(new EntityServiceImpl(repositoryWithDataFrom("work_with_incoming_relations.ttl"), mockKohaAdapter), mockSearchService, mockKohaAdapter);
        XURI xuri = new XURI("http://data.deichman.no/work/w245846040007");
        Response result = entityResource.retriveResourceParticipations(xuri.getType(), xuri.getId());
        assertEquals("[\n"
                + "  {\n"
                + "    \"relationshipType\": \"http://data.deichman.no/ontology#subject\",\n"
                + "    \"relationships\": [\n"
                + "      {\n"
                + "        \"relationshipType\": \"http://data.deichman.no/ontology#subject\",\n"
                + "        \"mainTitle\": \"Oomph\",\n"
                + "        \"targetType\": \"Work\",\n"
                + "        \"targetUri\": \"http://data.deichman.no/work/w328159667858\"\n"
                + "      }\n"
                + "    ]\n"
                + "  },\n"
                + "  {\n"
                + "    \"relationshipType\": \"http://data.deichman.no/ontology#publicationOf\",\n"
                + "    \"relationships\": [\n"
                + "      {\n"
                + "        \"relationshipType\": \"http://data.deichman.no/ontology#publicationOf\",\n"
                + "        \"mainTitle\": \"Slümp\",\n"
                + "        \"targetType\": \"Publication\",\n"
                + "        \"targetUri\": \"http://data.deichman.no/publication/p869363145190\"\n"
                + "      }\n"
                + "    ]\n"
                + "  },\n"
                + "  {\n"
                + "    \"relationshipType\": \"http://data.deichman.no/relationType#continuedIn\",\n"
                + "    \"relationships\": [\n"
                + "      {\n"
                + "        \"relationshipType\": \"http://data.deichman.no/relationType#continuedIn\",\n"
                + "        \"mainTitle\": \"Oomph\",\n"
                + "        \"targetType\": \"Work\",\n"
                + "        \"targetUri\": \"http://data.deichman.no/work/w328159667858\"\n"
                + "      }\n"
                + "    ]\n"
                + "  }\n"
                + "]", result.getEntity());
    }

    @Test
    public void should_return_publication_as_inversely_related() throws Exception {
        entityResource = new EntityResource(new EntityServiceImpl(repositoryWithDataFrom("work_w87654.ttl"), mockKohaAdapter), mockSearchService, mockKohaAdapter);
        XURI xuri = new XURI("http://deichman.no/work/w87654");
        Response result = entityResource.retrieveInverseRelationsBy(xuri.getType(), xuri.getId(), "publicationOf", newArrayList("mainTitle", "subtitle"));
        assertEquals("[\n"
                + "  {\n"
                + "    \"uri\": \"http://data.deichman.no/publication/p80002\",\n"
                + "    \"projections\": {\n"
                + "      \"mainTitle\": \"Much ado about nothing\",\n"
                + "      \"subtitle\": \"Hey nonny nonny\"\n"
                + "    }\n"
                + "  },\n"
                + "  {\n"
                + "    \"uri\": \"http://data.deichman.no/publication/p80001\",\n"
                + "    \"projections\": {}\n"
                + "  }\n"
                + "]", result.getEntity());
    }

    @Test
    public void should_return_cloned_resource() throws Exception {
        entityResource = new EntityResource(new EntityServiceImpl(repositoryWithDataFrom("work_w67783.ttl"), mockKohaAdapter), mockSearchService, mockKohaAdapter);
        XURI xuri = new XURI("http://deichman.no/work/w67783");
        Model originalModel = RDFModelUtil.modelFrom(entityResource.get(xuri.getType(), xuri.getId()).getEntity().toString(), Lang.JSONLD);
        Response result = entityResource.cloneResource(xuri.getType(), xuri.getId());
        String cloneId = new XURI(result.getHeaderString(LOCATION)).getId();

        final Response clonedResponse = entityResource.get(xuri.getType(), cloneId);

        String cloneContent = clonedResponse.getEntity().toString();
        Model cloneModel = RDFModelUtil.modelFrom(cloneContent.replace(cloneId, xuri.getId()), Lang.JSONLD);
        long numberOfStatementsInCloneModelBefore = cloneModel.size();
        cloneModel.removeAll(null, ResourceFactory.createProperty(BaseURI.ontology("created")), null);
        cloneModel.removeAll(null, ResourceFactory.createProperty("http://migration.deichman.no/clonedFrom"), null);
        assertTrue(originalModel.isIsomorphicWith(cloneModel));
        assertThat(cloneModel.size(), is(numberOfStatementsInCloneModelBefore - 2));
    }

    @Test
    public void should_return_cloned_publication_with_new_record_id() throws Exception {
        when(mockKohaAdapter.createNewBiblioWithMarcRecord(any())).thenReturn(A_BIBLIO_ID);
        entityResource = new EntityResource(new EntityServiceImpl(repositoryWithDataFrom("work_w87654.ttl"), mockKohaAdapter), mockSearchService, mockKohaAdapter);
        XURI oldPubUri = new XURI("http://data.deichman.no/publication/p80002");
        Response result = entityResource.cloneResource(oldPubUri.getType(), oldPubUri.getId());
        final String clonedUri = result.getHeaderString(LOCATION);
        String cloneId = new XURI(clonedUri).getId();

        final Response clonedResponse = entityResource.get(oldPubUri.getType(), cloneId);

        String cloneContent = clonedResponse.getEntity().toString();
        Model cloneModel = RDFModelUtil.modelFrom(cloneContent.replace(cloneId, new XURI(clonedUri).getId()), Lang.JSONLD);
        assertThat(cloneModel.getProperty(ResourceFactory.createResource(clonedUri), ResourceFactory.createProperty(BaseURI.ontology("recordId"))).getString(), is(A_BIBLIO_ID));
    }
}
