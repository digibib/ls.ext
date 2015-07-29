package no.deichman.services.service;

import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;
import com.hp.hpl.jena.rdf.model.NodeIterator;
import com.hp.hpl.jena.rdf.model.Property;
import com.hp.hpl.jena.rdf.model.ResourceFactory;
import com.hp.hpl.jena.rdf.model.Statement;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import no.deichman.services.error.PatchParserException;
import no.deichman.services.kohaadapter.KohaAdapter;
import no.deichman.services.kohaadapter.Marc2Rdf;
import no.deichman.services.repository.Repository;
import no.deichman.services.repository.RepositoryInMemory;
import no.deichman.services.uridefaults.BaseURIMock;
import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFDataMgr;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import org.junit.Before;
import org.junit.Test;
import org.marc4j.MarcReader;
import org.marc4j.MarcXmlReader;
import org.marc4j.marc.Record;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class ServiceImplTest {
    
    private ServiceImpl service;
    private Repository repository;

    @Before
    public void setup(){
        repository = new RepositoryInMemory();
        service = new ServiceImpl(new BaseURIMock(), repository, null);
    }

    @Test
    public void should_have_default_constructor() {
        assertNotNull(new ServiceImpl());
    }

    @Test
    public void test_retrieve_work_by_id(){
        String workData = "{\"@context\": {\"dcterms\": \"http://purl.org/dc/terms/\",\"deichman\": \"http://deichman.no/ontology#\"},\"@graph\": {\"@id\": \"http://deichman.no/work/work_SHOULD_BE_PATCHABLE\",\"@type\": \"deichman:Work\",\"dcterms:identifier\":\"TEST_REPOSITORY_IS_SET\"}}";
        String workId = service.createWork(workData);
        Model comparison = ModelFactory.createDefaultModel();
        InputStream in = new ByteArrayInputStream(workData.replace("http://deichman.no/work/work_SHOULD_BE_PATCHABLE", workId).getBytes(StandardCharsets.UTF_8));
        RDFDataMgr.read(comparison, in, Lang.JSONLD);
        Model test = service.retrieveWorkById(workId.replace("http://deichman.no/work/", ""));
        assertTrue(test.isIsomorphicWith(comparison));
    }

    @Test
    public void test_retrieve_publication_by_id(){
        String publicationData = "{\"@context\": {\"dcterms\": \"http://purl.org/dc/terms/\",\"deichman\": \"http://deichman.no/ontology#\"},\"@graph\": {\"@id\": \"http://deichman.no/publication/publication_SHOULD_BE_PATCHABLE\",\"@type\": \"deichman:Publication\",\"dcterms:identifier\":\"TEST_REPOSITORY_IS_SET\"}}";
        String publicationId = service.createPublication(publicationData);
        Model comparison = ModelFactory.createDefaultModel();
        InputStream in = new ByteArrayInputStream(publicationData.replace("http://deichman.no/publication/publication_SHOULD_BE_PATCHABLE", publicationId).getBytes(StandardCharsets.UTF_8));
        RDFDataMgr.read(comparison, in, Lang.JSONLD);
        Model test = service.retrievePublicationById(publicationId.replace("http://deichman.no/publication/", ""));
        assertTrue(test.isIsomorphicWith(comparison));
    }

    @Test
    public void test_repository_can_be_set_got(){
        String workData = "{\"@context\": {\"dcterms\": \"http://purl.org/dc/terms/\",\"deichman\": \"http://deichman.no/ontology#\"},\"@graph\": {\"@id\": \"http://deichman.no/work/work_SHOULD_BE_PATCHABLE\",\"@type\": \"deichman:Work\",\"dcterms:identifier\":\"TEST_REPOSITORY_IS_SET\"}}";
        String workId = service.createWork(workData);
        Statement s = ResourceFactory.createStatement(
                ResourceFactory.createResource(workId),
                ResourceFactory.createProperty("http://purl.org/dc/terms/identifier"),
                ResourceFactory.createPlainLiteral("TEST_REPOSITORY_IS_SET"));
        assertTrue(repository.askIfStatementExists(s));
    }

    private Model modelForBiblio() { // TODO return much simpler model
        Model model = ModelFactory.createDefaultModel();
        Model m = ModelFactory.createDefaultModel();
        InputStream in = getClass().getClassLoader().getResourceAsStream("marc.xml");
        MarcReader reader = new MarcXmlReader(in);
        Marc2Rdf marcRdf = new Marc2Rdf(new BaseURIMock());
        while (reader.hasNext()) {
            Record record = reader.next();
            m.add(marcRdf.mapItemsToModel(record.getVariableFields("952")));
        }
        model.add(m);
        return model;
    }

    @Test
    public void test_retrieve_work_items_by_id(){
        KohaAdapter mockKohaAdapter = mock(KohaAdapter.class);
        when(mockKohaAdapter.getBiblio("626460")).thenReturn(modelForBiblio());

        Service myService = new ServiceImpl(new BaseURIMock(), repository, mockKohaAdapter);
        Model m = myService.retrieveWorkItemsById("work_TEST_KOHA_ITEMS_LINK");
        Property p = ResourceFactory.createProperty("http://deichman.no/ontology#hasEdition");
        NodeIterator ni = m.listObjectsOfProperty(p);
        
        int i = 0;
        while (ni.hasNext()) {
            i++;
            ni.next();
        }
        final int expectedNoOfItems = 34;
        assertEquals(expectedNoOfItems,i);
    }

    @Test
    public void test_create_work(){
        String work = "{\"@context\": {\"dcterms\": \"http://purl.org/dc/terms/\",\"deichman\": \"http://deichman.no/ontology#\"},\"@graph\": {\"@id\": \"http://deichman.no/work/work_SHOULD_EXIST\",\"@type\": \"deichman:Work\",\"dcterms:identifier\":\"work_SERVICE_CREATE_WORK\",\"deichman:biblio\":\"1\"}}";
        String workId = service.createWork(work);
        Statement s = ResourceFactory.createStatement(
                ResourceFactory.createResource(workId), ResourceFactory.createProperty("http://purl.org/dc/terms/identifier"), ResourceFactory.createPlainLiteral("work_SERVICE_CREATE_WORK"));
        assertTrue(repository.askIfStatementExists(s));
    }

    @Test
    public void test_create_publication(){
        String publication = "{\"@context\": {\"dcterms\": \"http://purl.org/dc/terms/\",\"deichman\": \"http://deichman.no/ontology#\"},\"@graph\": {\"@id\": \"http://deichman.no/publication/publication_SHOULD_EXIST\",\"@type\": \"deichman:Publication\",\"dcterms:identifier\":\"publication_SERVICE_CREATE_PUBLICATION\",\"deichman:biblio\":\"1\"}}";
        String publicationId = service.createPublication(publication);
        Statement s = ResourceFactory.createStatement(
                ResourceFactory.createResource(publicationId), ResourceFactory.createProperty("http://purl.org/dc/terms/identifier"), ResourceFactory.createPlainLiteral("publication_SERVICE_CREATE_PUBLICATION"));
        assertTrue(repository.askIfStatementExists(s));
    }

    @Test
    public void test_delete_work(){
        String work = "{\"@context\": {\"dcterms\": \"http://purl.org/dc/terms/\",\"deichman\": \"http://deichman.no/ontology#\"},\"@graph\": {\"@id\": \"http://deichman.no/work/work_SHOULD_EXIST\",\"@type\": \"deichman:Work\",\"dcterms:identifier\":\"work_SERVICE_CREATE_WORK\",\"deichman:biblio\":\"1\"}}";
        String workId = service.createWork(work);
        Statement s = ResourceFactory.createStatement(
                ResourceFactory.createResource(workId), ResourceFactory.createProperty("http://purl.org/dc/terms/identifier"), ResourceFactory.createPlainLiteral("work_SERVICE_CREATE_WORK"));
        assertTrue(repository.askIfStatementExists(s));
        Model test = ModelFactory.createDefaultModel();
        InputStream in = new ByteArrayInputStream(work.replace("http://deichman.no/work/work_SHOULD_EXIST", workId).getBytes(StandardCharsets.UTF_8));
        RDFDataMgr.read(test,in, Lang.JSONLD);
        service.deleteWork(test);
        assertFalse(repository.askIfStatementExists(s));
    }

    @Test
    public void test_delete_publication(){
        String publication = "{\"@context\": {\"dcterms\": \"http://purl.org/dc/terms/\",\"deichman\": \"http://deichman.no/ontology#\"},\"@graph\": {\"@id\": \"http://deichman.no/publication/publication_SHOULD_EXIST\",\"@type\": \"deichman:Publication\",\"dcterms:identifier\":\"publication_delete_publication\",\"deichman:biblio\":\"1\"}}";
        String publicationId = service.createPublication(publication);
        Statement s = ResourceFactory.createStatement(
                ResourceFactory.createResource(publicationId), ResourceFactory.createProperty("http://purl.org/dc/terms/identifier"), ResourceFactory.createPlainLiteral("publication_delete_publication"));
        assertTrue(repository.askIfStatementExists(s));
        Model test = ModelFactory.createDefaultModel();
        InputStream in = new ByteArrayInputStream(publication.replace("http://deichman.no/publication/publication_SHOULD_EXIST", publicationId).getBytes(StandardCharsets.UTF_8));
        RDFDataMgr.read(test,in, Lang.JSONLD);
        service.deleteWork(test);
        assertFalse(repository.askIfStatementExists(s));
    }

    @Test
    public void test_patch_work_add() throws Exception{
        Model oldModel = ModelFactory.createDefaultModel();
        String workData = "{\"@context\": {\"dcterms\": \"http://purl.org/dc/terms/\",\"deichman\": \"http://deichman.no/ontology#\"},\"@graph\": {\"@id\": \"http://deichman.no/work/work_SHOULD_BE_PATCHABLE\",\"@type\": \"deichman:Work\",\"dcterms:identifier\":\"work_SERVICE_DEFAULT_PATCH\"}}";
        String workId = service.createWork(workData);
        String comparisonRDF = workData.replace("http://deichman.no/work/work_SHOULD_BE_PATCHABLE", workId);
        InputStream oldIn = new ByteArrayInputStream(comparisonRDF.getBytes(StandardCharsets.UTF_8));
        RDFDataMgr.read(oldModel, oldIn, Lang.JSONLD);
        Model data = service.retrieveWorkById(workId.replace("http://deichman.no/work/", ""));
        assertTrue(oldModel.isIsomorphicWith(data));
        String patchData = "{"
                + "\"op\": \"add\","
                + "\"s\": \"" + workId + "\","
                + "\"p\": \"http://deichman.no/ontology#color\","
                + "\"o\": {"
                + "\"value\": \"red\""
                + "}"
                + "}";
        Model patchedModel = service.patchWork(workId.replace("http://deichman.no/work/", ""),patchData);
        assertTrue(patchedModel.contains(ResourceFactory.createResource(workId), ResourceFactory.createProperty("http://deichman.no/ontology#color"), "red"));
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        RDFDataMgr.write(baos,patchedModel.difference(oldModel),Lang.NT);
        assertEquals(baos.toString().trim(),
                "<"+ workId + "> <http://deichman.no/ontology#color> \"red\" .");
    }

    @Test
    public void test_patch_publication_add() throws Exception{
        Model oldModel = ModelFactory.createDefaultModel();
        String publicationData = "{\"@context\": {\"dcterms\": \"http://purl.org/dc/terms/\",\"deichman\": \"http://deichman.no/ontology#\"},\"@graph\": {\"@id\": \"http://deichman.no/publication/publication_SHOULD_BE_PATCHABLE\",\"@type\": \"deichman:Publication\",\"dcterms:identifier\":\"publication_SERVICE_DEFAULT_PATCH\"}}";
        String publicationId = service.createPublication(publicationData);
        String comparisonRDF = publicationData.replace("http://deichman.no/publication/publication_SHOULD_BE_PATCHABLE", publicationId);
        InputStream oldIn = new ByteArrayInputStream(comparisonRDF.getBytes(StandardCharsets.UTF_8));
        RDFDataMgr.read(oldModel, oldIn, Lang.JSONLD);
        Model data = service.retrievePublicationById(publicationId.replace("http://deichman.no/publication/", ""));
        assertTrue(oldModel.isIsomorphicWith(data));
        String patchData = "{"
                + "\"op\": \"add\","
                + "\"s\": \"" + publicationId + "\","
                + "\"p\": \"http://deichman.no/ontology#color\","
                + "\"o\": {"
                + "\"value\": \"red\""
                + "}"
                + "}";
        Model patchedModel = service.patchPublication(publicationId.replace("http://deichman.no/publication/", ""),patchData);
        assertTrue(patchedModel.contains(ResourceFactory.createResource(publicationId), ResourceFactory.createProperty("http://deichman.no/ontology#color"), "red"));
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        RDFDataMgr.write(baos,patchedModel.difference(oldModel),Lang.NT);
        assertEquals(baos.toString().trim(),
                "<"+ publicationId + "> <http://deichman.no/ontology#color> \"red\" .");
    }

    @Test(expected=PatchParserException.class)
    public void test_bad_patch_fails() throws Exception{
        String workData = "{\"@context\": {\"dcterms\": \"http://purl.org/dc/terms/\",\"deichman\": \"http://deichman.no/ontology#\"},\"@graph\": {\"@id\": \"http://deichman.no/work/work_SHOULD_BE_PATCHABLE\",\"@type\": \"deichman:Work\",\"dcterms:identifier\":\"work_SERVICE_DEFAULT_PATCH\"}}";
        String workId = service.createWork(workData);
        String badPatchData = "{\"po\":\"cas\",\"s\":\"http://example.com/a\"}";
        service.patchWork(workId.replace("http://deichman.no/work/", ""),badPatchData);
    }
}
