package no.deichman.services.entity;

import no.deichman.services.entity.kohaadapter.KohaAdapter;
import no.deichman.services.entity.kohaadapter.Marc2Rdf;
import no.deichman.services.entity.patch.PatchParserException;
import no.deichman.services.entity.repository.InMemoryRepository;
import no.deichman.services.rdf.RDFModelUtil;
import no.deichman.services.uridefaults.BaseURI;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.ResIterator;
import org.apache.jena.rdf.model.Statement;
import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFDataMgr;
import org.apache.jena.vocabulary.DCTerms;
import org.apache.jena.vocabulary.RDF;
import org.apache.jena.vocabulary.RDFS;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.marc4j.MarcReader;
import org.marc4j.MarcXmlReader;
import org.marc4j.marc.Record;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

import static no.deichman.services.entity.repository.InMemoryRepositoryTest.repositoryWithDataFrom;
import static org.apache.jena.rdf.model.ResourceFactory.createLangLiteral;
import static org.apache.jena.rdf.model.ResourceFactory.createPlainLiteral;
import static org.apache.jena.rdf.model.ResourceFactory.createProperty;
import static org.apache.jena.rdf.model.ResourceFactory.createResource;
import static org.apache.jena.rdf.model.ResourceFactory.createStatement;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.when;

@RunWith(MockitoJUnitRunner.class)
public class EntityServiceImplTest {

    private static final String A_BIBLIO_ID = "234567";
    public static final String SOME_BARCODE = "0123456789";
    private EntityServiceImpl service;
    private InMemoryRepository repository;
    private String ontologyURI;
    private String workURI;
    private String publicationURI;
    private String personURI;


    @Mock
    private KohaAdapter mockKohaAdapter;

    @Before
    public void setup(){
        BaseURI baseURI = BaseURI.local();
        repository = new InMemoryRepository();
        service = new EntityServiceImpl(baseURI, repository, mockKohaAdapter);
        ontologyURI = baseURI.ontology();
        workURI = baseURI.work();
        publicationURI = baseURI.publication();
        personURI = baseURI.person();
    }

    @Test
    public void test_retrieve_work_by_id(){
        String testId = "work_SHOULD_EXIST";
        String workData = getTestJSON(testId, "work");
        Model inputModel = RDFModelUtil.modelFrom(workData, Lang.JSONLD);
        String workId = service.create(EntityType.WORK, inputModel);
        Model comparison = ModelFactory.createDefaultModel();
        InputStream in = new ByteArrayInputStream(
                workData.replace(workURI + testId, workId)
                .getBytes(StandardCharsets.UTF_8));
        RDFDataMgr.read(comparison, in, Lang.JSONLD);
        Model test = service.retrieveById(EntityType.WORK, workId.replace(workURI, ""));
        assertTrue(test.isIsomorphicWith(comparison));
    }

    @Test
    public void test_retrieve_publication_by_id() throws Exception{
        when(mockKohaAdapter.getNewBiblio()).thenReturn(A_BIBLIO_ID);
        String testId = "publication_SHOULD_EXIST";
        String publicationData = getTestJSON(testId, "publication");
        Model inputModel = RDFModelUtil.modelFrom(publicationData, Lang.JSONLD);
        String publicationId = service.create(EntityType.PUBLICATION, inputModel);
        Model test = service.retrieveById(EntityType.PUBLICATION, publicationId.replace(publicationURI, ""));
        Statement testStatement = createStatement(
                createResource(publicationId),
                createProperty(RDF.type.getURI()),
                createResource(ontologyURI + "Publication"));
        assertTrue(test.contains(testStatement));
    }

    @Test
    public void test_retrieve_work_by_id_with_language() {
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
        Model inputModel = RDFModelUtil.modelFrom(workData, Lang.JSONLD);
        String workId = service.create(EntityType.WORK, inputModel);
        Model test = service.retrieveById(EntityType.WORK, workId.replace(workURI, ""));
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

    static Model modelForBiblio() { // TODO return much simpler model
        Model model = ModelFactory.createDefaultModel();
        Model m = ModelFactory.createDefaultModel();
        InputStream in = EntityServiceImplTest.class.getClassLoader().getResourceAsStream("marc.xml");
        MarcReader reader = new MarcXmlReader(in);
        Marc2Rdf marcRdf = new Marc2Rdf(BaseURI.local());
        while (reader.hasNext()) {
            Record record = reader.next();
            m.add(marcRdf.mapItemsToModel(record.getVariableFields("952")));
        }
        model.add(m);
        return model;
    }

    @Test
    public void test_retrieve_work_by_id_with_format() {
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
        Model inputModel = RDFModelUtil.modelFrom(workData, Lang.JSONLD);
        String workId = service.create(EntityType.WORK, inputModel);
        Model test = service.retrieveById(EntityType.WORK, workId.replace(workURI, ""));
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
    public void test_retrieve_work_items_by_id(){
        when(mockKohaAdapter.getBiblio("626460")).thenReturn(EntityServiceImplTest.modelForBiblio());
        EntityService myService = new EntityServiceImpl(BaseURI.local(), repositoryWithDataFrom("testdata.ttl"), mockKohaAdapter);

        Model m = myService.retrieveWorkItemsById("work_TEST_KOHA_ITEMS_LINK");
        Property p = createProperty("http://deichman.no/ontology#editionOf");
        ResIterator ni = m.listSubjectsWithProperty(p);

        int i = 0;
        while (ni.hasNext()) {
            i++;
            ni.next();
        }
        final int expectedNoOfItems = 34;
        assertEquals(expectedNoOfItems, i);
    }

    @Test
    public void test_create_work(){
        String testId = "SERVICE_WORK_SHOULD_EXIST";
        String work = getTestJSON(testId, "work");
        Model inputModel = RDFModelUtil.modelFrom(work, Lang.JSONLD);

        final String uri = service.create(EntityType.WORK, inputModel);

        Statement s = createStatement(
                createResource(uri),
                createProperty(DCTerms.identifier.getURI()),
                createPlainLiteral(testId));
        assertTrue(repository.askIfStatementExists(s));
    }

    @Test
    public void test_create_publication(){
        when(mockKohaAdapter.getNewBiblio()).thenReturn(A_BIBLIO_ID);
        String testId = "SERVICE_PUBLICATION_SHOULD_EXIST";
        String publication = getTestJSON(testId, "publication");
        Model inputModel = RDFModelUtil.modelFrom(publication, Lang.JSONLD);

        String publicationId = service.create(EntityType.PUBLICATION, inputModel);

        Statement s = createStatement(
                createResource(publicationId),
                createProperty(DCTerms.identifier.getURI()),
                createPlainLiteral(testId));
        assertTrue(repository.askIfStatementExists(s));
    }

    @Test
    public void test_create_person(){
        String testId = "SERVICE_PERSON_SHOULD_EXIST";
        String person = getTestJSON(testId, "person");
        Model inputModel = RDFModelUtil.modelFrom(person, Lang.JSONLD);

        final String uri = service.create(EntityType.PERSON, inputModel);

        Statement s = createStatement(
                createResource(uri),
                createProperty(DCTerms.identifier.getURI()),
                createPlainLiteral(testId));
        assertTrue(repository.askIfStatementExists(s));
    }

    @Test
    public void test_create_and_delete_entity() throws Exception{
        when(mockKohaAdapter.getNewBiblio()).thenReturn(A_BIBLIO_ID);
        String testId = "publication_SHOULD_BE_DELETED";
        String publication = getTestJSON(testId, "publication");
        Model inputModel = RDFModelUtil.modelFrom(publication, Lang.JSONLD);
        String publicationId = service.create(EntityType.PUBLICATION, inputModel);
        Statement s = createStatement(
                createResource(publicationId),
                createProperty(DCTerms.identifier.getURI()),
                createPlainLiteral(testId));
        assertTrue(repository.askIfStatementExists(s));

        Model test = ModelFactory.createDefaultModel();
        InputStream in = new ByteArrayInputStream(
                publication.replace(publicationURI + testId, publicationId)
                .getBytes(StandardCharsets.UTF_8));
        RDFDataMgr.read(test,in, Lang.JSONLD);
        service.delete(test);
        assertFalse(repository.askIfStatementExists(s));
    }

    @Test
    public void test_patch_work_add() throws Exception{
        String testId = "work_SHOULD_BE_PATCHABLE";
        String workData = getTestJSON(testId, "work");
        Model inputModel = RDFModelUtil.modelFrom(workData, Lang.JSONLD);
        String workId = service.create(EntityType.WORK, inputModel);

        Model oldModel = ModelFactory.createDefaultModel();

        String comparisonRDF = workData.replace(workURI + testId, workId);
        InputStream oldIn = new ByteArrayInputStream(comparisonRDF.getBytes(StandardCharsets.UTF_8));
        RDFDataMgr.read(oldModel, oldIn, Lang.JSONLD);
        String nonUriWorkId = workId.replace(workURI, "");
        Model data = service.retrieveById(EntityType.WORK, nonUriWorkId);
        assertTrue(oldModel.isIsomorphicWith(data));
        String patchData = getTestPatch("add", workId);
        Model patchedModel = service.patch(EntityType.WORK, nonUriWorkId, patchData);
        assertTrue(patchedModel.contains(
                createResource(workId),
                createProperty(ontologyURI + "color"),
                "red"));
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        RDFDataMgr.write(baos,patchedModel.difference(oldModel),Lang.NT);
        assertEquals(baos.toString("UTF-8").trim(),
                "<"+ workId + "> <" + ontologyURI + "color> \"red\" .");
    }

    @Test
    public void test_patch_publication_add() throws Exception{
        when(mockKohaAdapter.getNewBiblio()).thenReturn(A_BIBLIO_ID);
        String testId = "publication_SHOULD_BE_PATCHABLE";
        String publicationData = getTestJSON(testId,"publication");
        Model inputModel = RDFModelUtil.modelFrom(publicationData, Lang.JSONLD);
        String publicationId = service.create(EntityType.PUBLICATION, inputModel);
        String nonUriPublicationId = publicationId.replace(publicationURI, "");
        String patchData = getTestPatch("add", publicationId);
        Model patchedModel = service.patch(EntityType.PUBLICATION, nonUriPublicationId, patchData);
        assertTrue(patchedModel.contains(
                createResource(publicationId),
                createProperty(ontologyURI + "color"),
                "red"));
    }

    @Test(expected=PatchParserException.class)
    public void test_bad_patch_fails() throws Exception{
        String workData = getTestJSON("SHOULD_FAIL","work");
        Model inputModel = RDFModelUtil.modelFrom(workData, Lang.JSONLD);
        String workId = service.create(EntityType.WORK, inputModel);
        String badPatchData = "{\"po\":\"cas\",\"s\":\"http://example.com/a\"}";
        service.patch(EntityType.WORK, workId.replace(workURI, ""), badPatchData);
    }

    private String getTestJSON(String id, String type) {
        String resourceClass = null;
        String resourceURI = null;

        switch (type.toLowerCase()) {
            case "work" : resourceClass = "Work";
                resourceURI = workURI;
                break;
            case "publication" : resourceClass = "Publication";
                resourceURI = publicationURI;
                break;
            case "person" : resourceClass = "Person";
                resourceURI = personURI;
                break;
            default: break;
        }

        return "{\"@context\": "
                + "{\"dcterms\": \"http://purl.org/dc/terms/\","
                + "\"deichman\": \"" + ontologyURI + "\"},"
                + "\"@graph\": "
                + "{\"@id\": \"" + resourceURI + "" + id + "\","
                + "\"@type\": \"deichman:" + resourceClass + "\","
                + "\"dcterms:identifier\":\"" + id + "\"}}";
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

}
