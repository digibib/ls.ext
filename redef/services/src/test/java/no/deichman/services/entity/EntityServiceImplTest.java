package no.deichman.services.entity;

import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;
import com.hp.hpl.jena.rdf.model.NodeIterator;
import com.hp.hpl.jena.rdf.model.Property;
import com.hp.hpl.jena.rdf.model.ResourceFactory;
import com.hp.hpl.jena.rdf.model.Statement;
import com.hp.hpl.jena.vocabulary.DCTerms;
import com.hp.hpl.jena.vocabulary.RDF;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import no.deichman.services.entity.kohaadapter.KohaAdapter;
import no.deichman.services.entity.kohaadapter.Marc2Rdf;
import no.deichman.services.entity.patch.PatchParserException;
import no.deichman.services.entity.repository.InMemoryRepository;
import no.deichman.services.uridefaults.BaseURI;
import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFDataMgr;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.marc4j.MarcReader;
import org.marc4j.MarcXmlReader;
import org.marc4j.marc.Record;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;

import static no.deichman.services.entity.repository.InMemoryRepositoryTest.repositoryWithDataFrom;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.when;

@RunWith(MockitoJUnitRunner.class)
public class EntityServiceImplTest {

    private static final String A_BIBLIO_ID = "234567";
    private EntityServiceImpl service;
    private InMemoryRepository repository;
    private String ontologyURI;
    private String workURI;
    private String publicationURI;


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
    }

    @Test
    public void test_retrieve_work_by_id(){
        String testId = "work_SHOULD_EXIST";
        String workData = getTestJSON(testId,"work");
        String workId = service.create(EntityType.WORK, workData);
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
        String publicationData = getTestJSON(testId,"publication");
        String publicationId = service.create(EntityType.PUBLICATION, publicationData);
        Model test = service.retrieveById(EntityType.PUBLICATION, publicationId.replace(publicationURI, ""));
        Statement testStatement = ResourceFactory.createStatement(
                ResourceFactory.createResource(publicationId),
                ResourceFactory.createProperty(RDF.type.getURI()),
                ResourceFactory.createResource(ontologyURI + "Publication"));
        assertTrue(test.contains(testStatement));
    }

    @Test
    public void test_repository_can_be_set_got(){
        String testId = "work_TEST_REPOSITORY";
        String workData = getTestJSON(testId, "work");
        String workId = service.create(EntityType.WORK, workData);
        Statement s = ResourceFactory.createStatement(
                ResourceFactory.createResource(workId),
                ResourceFactory.createProperty(DCTerms.identifier.getURI()),
                ResourceFactory.createPlainLiteral(testId));
        assertTrue(repository.askIfStatementExists(s));
    }

    private Model modelForBiblio() { // TODO return much simpler model
        Model model = ModelFactory.createDefaultModel();
        Model m = ModelFactory.createDefaultModel();
        InputStream in = getClass().getClassLoader().getResourceAsStream("marc.xml");
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
    public void test_retrieve_work_items_by_id(){
        when(mockKohaAdapter.getBiblio("626460")).thenReturn(modelForBiblio());
        EntityService myService = new EntityServiceImpl(BaseURI.local(), repositoryWithDataFrom("testdata.ttl"), mockKohaAdapter);

        Model m = myService.retrieveWorkItemsById("work_TEST_KOHA_ITEMS_LINK");
        Property p = ResourceFactory.createProperty(ontologyURI + "hasEdition");
        NodeIterator ni = m.listObjectsOfProperty(p);

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
        String work = getTestJSON(testId,"work");
        Statement s = ResourceFactory.createStatement(
                ResourceFactory.createResource(service.create(EntityType.WORK, work)),
                ResourceFactory.createProperty(DCTerms.identifier.getURI()),
                ResourceFactory.createPlainLiteral(testId));
        assertTrue(repository.askIfStatementExists(s));
    }

    @Test
    public void test_create_publication() throws Exception{
        when(mockKohaAdapter.getNewBiblio()).thenReturn(A_BIBLIO_ID);
        String testId = "publication_SERVICE_CREATE_PUBLICATION";
        String publication = getTestJSON(testId, "publication");
        String publicationId = service.create(EntityType.PUBLICATION, publication);
        Statement s = ResourceFactory.createStatement(
                ResourceFactory.createResource(publicationId),
                ResourceFactory.createProperty(DCTerms.identifier.getURI()),
                ResourceFactory.createPlainLiteral(testId));
        assertTrue(repository.askIfStatementExists(s));
    }

    @Test
    public void test_delete_work(){
        String testId = "work_SHOULD_BE_DELETED";
        String work = getTestJSON(testId,"work");
        String workId = service.create(EntityType.WORK, work);
        Statement s = ResourceFactory.createStatement(
                ResourceFactory.createResource(workId),
                ResourceFactory.createProperty(DCTerms.identifier.getURI()),
                ResourceFactory.createPlainLiteral(testId));
        assertTrue(repository.askIfStatementExists(s));
        Model test = ModelFactory.createDefaultModel();
        InputStream in = new ByteArrayInputStream(
                work.replace(workURI + testId, workId)
                .getBytes(StandardCharsets.UTF_8));
        RDFDataMgr.read(test,in, Lang.JSONLD);
        service.delete(test);
        assertFalse(repository.askIfStatementExists(s));
    }

    @Test
    public void test_delete_publication() throws Exception{
        when(mockKohaAdapter.getNewBiblio()).thenReturn(A_BIBLIO_ID);
        String testId = "publication_SHOULD_BE_DELETED";
        String publication = getTestJSON(testId, "publication");
        String publicationId = service.create(EntityType.PUBLICATION, publication);
        Statement s = ResourceFactory.createStatement(
                ResourceFactory.createResource(publicationId),
                ResourceFactory.createProperty(DCTerms.identifier.getURI()),
                ResourceFactory.createPlainLiteral(testId));
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
        String workId = service.create(EntityType.WORK, workData);

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
                ResourceFactory.createResource(workId),
                ResourceFactory.createProperty(ontologyURI + "color"),
                "red"));
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        RDFDataMgr.write(baos,patchedModel.difference(oldModel),Lang.NT);
        assertEquals(baos.toString().trim(),
                "<"+ workId + "> <" + ontologyURI + "color> \"red\" .");
    }

    @Test
    public void test_patch_publication_add() throws Exception{
        when(mockKohaAdapter.getNewBiblio()).thenReturn(A_BIBLIO_ID);
        String testId = "publication_SHOULD_BE_PATCHABLE";
        String publicationData = getTestJSON(testId,"publication");
        String publicationId = service.create(EntityType.PUBLICATION, publicationData);
        String nonUriPublicationId = publicationId.replace(publicationURI, "");
        String patchData = getTestPatch("add", publicationId);
        Model patchedModel = service.patch(EntityType.PUBLICATION, nonUriPublicationId, patchData);
        assertTrue(patchedModel.contains(
                ResourceFactory.createResource(publicationId),
                ResourceFactory.createProperty(ontologyURI + "color"),
                "red"));
    }

    @Test(expected=PatchParserException.class)
    public void test_bad_patch_fails() throws Exception{
        String workData = getTestJSON("SHOULD_FAIL","work");
        String workId = service.create(EntityType.WORK, workData);
        String badPatchData = "{\"po\":\"cas\",\"s\":\"http://example.com/a\"}";
        service.patch(EntityType.WORK, workId.replace(workURI, ""), badPatchData);
    }

    private String getTestJSON(String id, String type) {
        String resourceClass = null;
        String resourceURI = null;

        if (type.toLowerCase().equals("work")) {
            resourceClass = "Work";
            resourceURI = workURI;
        } else if (type.toLowerCase().equals("publication")) {
            resourceClass = "Publication";
            resourceURI = publicationURI;
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
