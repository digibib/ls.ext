package no.deichman.services.service;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;

import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFDataMgr;
import org.junit.Before;
import org.junit.Test;

import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;
import com.hp.hpl.jena.rdf.model.NodeIterator;
import com.hp.hpl.jena.rdf.model.Property;
import com.hp.hpl.jena.rdf.model.ResIterator;
import com.hp.hpl.jena.rdf.model.ResourceFactory;
import com.hp.hpl.jena.rdf.model.Selector;
import com.hp.hpl.jena.rdf.model.SimpleSelector;
import com.hp.hpl.jena.rdf.model.Statement;

import no.deichman.services.error.PatchException;
import no.deichman.services.error.PatchParserException;
import no.deichman.services.kohaadapter.KohaAdapterMock;
import no.deichman.services.repository.Repository;
import no.deichman.services.repository.RepositoryInMemory;
import no.deichman.services.uridefaults.BaseURIMock;

public class ServiceDefaultTest {
    
    private ServiceDefault service;
    @Before
    public void setup(){
        service = new ServiceDefault(new BaseURIMock());
        service.setRepository(new RepositoryInMemory());
        service.setKohaAdapter(new KohaAdapterMock());
    }

    @Test
    public void test_retrieve_work_by_id(){
        Repository repository = new RepositoryInMemory();
        service.setRepository(repository);
        String workData = "{\"@context\": {\"dcterms\": \"http://purl.org/dc/terms/\",\"deichman\": \"http://deichman.no/ontology#\"},\"@graph\": {\"@id\": \"http://deichman.no/work/work_SHOULD_BE_PATCHABLE\",\"@type\": \"deichman:Work\",\"dcterms:identifier\":\"TEST_REPOSITORY_IS_SET\"}}";
        String workId = service.createWork(workData);
        Model comparison = ModelFactory.createDefaultModel();
        InputStream in = new ByteArrayInputStream(workData.replace("http://deichman.no/work/work_SHOULD_BE_PATCHABLE", workId).getBytes(StandardCharsets.UTF_8));
        RDFDataMgr.read(comparison, in, Lang.JSONLD);
        Model test = service.retrieveWorkById(workId.replace("http://deichman.no/work/", ""));
        assertTrue(test.isIsomorphicWith(comparison));
    }

    @Test
    public void test_repository_can_be_set_got(){
        Repository repository = new RepositoryInMemory();
        String workData = "{\"@context\": {\"dcterms\": \"http://purl.org/dc/terms/\",\"deichman\": \"http://deichman.no/ontology#\"},\"@graph\": {\"@id\": \"http://deichman.no/work/work_SHOULD_BE_PATCHABLE\",\"@type\": \"deichman:Work\",\"dcterms:identifier\":\"TEST_REPOSITORY_IS_SET\"}}";
        service.setRepository(repository);
        String workId = service.createWork(workData);
        Statement s = ResourceFactory.createStatement(
                ResourceFactory.createResource(workId),
                ResourceFactory.createProperty("http://purl.org/dc/terms/identifier"),
                ResourceFactory.createPlainLiteral("TEST_REPOSITORY_IS_SET"));
        assertTrue(repository.askIfStatementExists(s));
        assertTrue(service.getRepository().equals(repository));
    }

    @Test
    public void test_koha_adapter_is_set(){
        KohaAdapterMock ka = new KohaAdapterMock();
        service.setBiblioIDProperty("http://deichman.no/ontology#");
        service.setKohaAdapter(ka);
        assertNotNull(service.retrieveWorkItemsById("626460"));
    }

    @Test
    public void test_retrieve_work_items_by_id(){
        Model m = service.retrieveWorkItemsById("work_TEST_KOHA_ITEMS_LINK");
        RDFDataMgr.write(System.out, m, Lang.TURTLE);
        Property p = ResourceFactory.createProperty("http://deichman.no/ontology#hasEdition");
        NodeIterator ni = m.listObjectsOfProperty(p);
        
        int i = 0;
        while (ni.hasNext()) {
            i++;
            ni.next();
        }
        assertEquals(34,i);
    }

    @Test
    public void test_create_work(){
        Repository r = new RepositoryInMemory();
        String work = "{\"@context\": {\"dcterms\": \"http://purl.org/dc/terms/\",\"deichman\": \"http://deichman.no/ontology#\"},\"@graph\": {\"@id\": \"http://deichman.no/work/work_SHOULD_EXIST\",\"@type\": \"deichman:Work\",\"dcterms:identifier\":\"work_SERVICE_CREATE_WORK\",\"deichman:biblio\":\"1\"}}";
        service.setRepository(r);
        String workId = service.createWork(work);
        Statement s = ResourceFactory.createStatement(
                ResourceFactory.createResource(workId), ResourceFactory.createProperty("http://purl.org/dc/terms/identifier"), ResourceFactory.createPlainLiteral("work_SERVICE_CREATE_WORK"));
        assertTrue(r.askIfStatementExists(s));
    }

    @Test
    public void test_delete_work(){
        Repository r = new RepositoryInMemory();
        String work = "{\"@context\": {\"dcterms\": \"http://purl.org/dc/terms/\",\"deichman\": \"http://deichman.no/ontology#\"},\"@graph\": {\"@id\": \"http://deichman.no/work/work_SHOULD_EXIST\",\"@type\": \"deichman:Work\",\"dcterms:identifier\":\"work_SERVICE_CREATE_WORK\",\"deichman:biblio\":\"1\"}}";
        service.setRepository(r);
        String workId = service.createWork(work);
        Statement s = ResourceFactory.createStatement(
                ResourceFactory.createResource(workId), ResourceFactory.createProperty("http://purl.org/dc/terms/identifier"), ResourceFactory.createPlainLiteral("work_SERVICE_CREATE_WORK"));
        assertTrue(r.askIfStatementExists(s));
        Model test = ModelFactory.createDefaultModel();
        InputStream in = new ByteArrayInputStream(work.replace("http://deichman.no/work/work_SHOULD_EXIST", workId).getBytes(StandardCharsets.UTF_8));
        RDFDataMgr.read(test,in, Lang.JSONLD);
        service.deleteWork(test);
        assertFalse(r.askIfStatementExists(s));
    }

    @Test
    public void test_patch_work_add() throws Exception{
        assertNotNull(service);

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

    @Test(expected=PatchParserException.class)
    public void test_bad_patch_fails() throws Exception{
        assertNotNull(service);
        String workData = "{\"@context\": {\"dcterms\": \"http://purl.org/dc/terms/\",\"deichman\": \"http://deichman.no/ontology#\"},\"@graph\": {\"@id\": \"http://deichman.no/work/work_SHOULD_BE_PATCHABLE\",\"@type\": \"deichman:Work\",\"dcterms:identifier\":\"work_SERVICE_DEFAULT_PATCH\"}}";
        String workId = service.createWork(workData);
        String badPatchData = "{\"po\":\"cas\",\"s\":\"http://example.com/a\"}";
        Model patchedModel = service.patchWork(workId.replace("http://deichman.no/work/", ""),badPatchData);
    }
}
