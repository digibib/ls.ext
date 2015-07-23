package no.deichman.services.repository;

import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;
import com.hp.hpl.jena.rdf.model.ResourceFactory;
import com.hp.hpl.jena.rdf.model.Statement;
import com.hp.hpl.jena.sparql.core.DatasetImpl;
import com.hp.hpl.jena.vocabulary.RDF;
import no.deichman.services.patch.Patch;
import no.deichman.services.uridefaults.BaseURIMock;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

public class RepositoryInMemoryTest {
    private RepositoryInMemory repository;
    private Statement testWorkStmt;
    private Statement testPublicationStmt;
    private List<Statement> stmts;



    @Before
    public void setup(){
        repository = new RepositoryInMemory();
        BaseURIMock bud = new BaseURIMock();
        testWorkStmt = ResourceFactory.createStatement(
                        ResourceFactory.createResource(bud.getWorkURI() + "test_id_123"),
                        ResourceFactory.createProperty("http://example.com/ontology/name"),
                        ResourceFactory.createPlainLiteral("Test"));
        testPublicationStmt = ResourceFactory.createStatement(
                ResourceFactory.createResource(bud.getPublicationURI() + "test_id_Publication"), 
                ResourceFactory.createProperty("http://example.com/ontology/name"),
                ResourceFactory.createPlainLiteral("Test"));
        Statement testWork0 = ResourceFactory.createStatement(
                ResourceFactory.createResource(bud.getWorkURI() + "test_id_1234"), 
                RDF.type,
                ResourceFactory.createResource(bud.getOntologyURI() + "Work"));
        Statement testWork1 = ResourceFactory.createStatement(
                ResourceFactory.createResource(bud.getPublicationURI() + "test_id_12345"), 
                RDF.type,
                ResourceFactory.createResource(bud.getOntologyURI() + "Publication"));
        Statement testWork2 = ResourceFactory.createStatement(
                ResourceFactory.createResource(bud.getPublicationURI() + "test_id_12345"), 
                ResourceFactory.createProperty(bud.getOntologyURI() + "publicationOf"),
                ResourceFactory.createResource(bud.getWorkURI() + "test_id_1234"));
        stmts  = new ArrayList<Statement>();
        stmts.add(testWork0);
        stmts.add(testWork1);
        stmts.add(testWork2);
    }

    @Test
    public void test_it_exists(){
        assertNotNull(new RepositoryInMemory());
    }

    @Test
    public void test_create_publication(){
        String publication = "{\"@context\": {\"dcterms\": \"http://purl.org/dc/terms/\",\"deichman\": \"http://deichman.no/ontology#\"},\"@graph\": {\"@id\": \"http://deichman.no/publication/publication_SHOULD_EXIST\",\"@type\": \"deichman:Work\",\"dcterms:identifier\":\"publication_SERVICE_CREATE_WORK\",\"deichman:biblio\":\"1\"}}";
        assertNotNull(repository.createPublication(publication));
    }

    @Test
    public void test_add_data(){
        Model testModel = ModelFactory.createDefaultModel();
        Statement s = ResourceFactory.createStatement(
                ResourceFactory.createResource("http://example.com/a"), 
                ResourceFactory.createProperty("http://example.com/ontology/name"),
                ResourceFactory.createPlainLiteral("Test"));
        repository.addData(testModel);
        assertFalse(repository.askIfStatementExists(s));
        testModel.add(s);
        repository.addData(testModel);
        assertTrue(repository.askIfStatementExists(s));
    }

    @Test
    public void test_get_dataset(){
        assertTrue(repository.getDataset().getClass() == DatasetImpl.class);
    }

    @Test
    public void test_retrieve_work_by_id(){
        String id = "test_id_123";
        Model temp = ModelFactory.createDefaultModel();
        temp.add(testWorkStmt);
        repository.addData(temp);
        Model testModel = repository.retrieveWorkById(id);
        assertTrue(testModel.contains(testWorkStmt));
    }

    @Test
    public void test_retrieve_work_by_id2(){
        String id = "test_id_1234";
        Model temp = ModelFactory.createDefaultModel();
        temp.add(stmts);
        repository.addData(temp);
        Model testModel = repository.retrieveWorkById(id);
        stmts.forEach(stmt -> testModel.contains(stmt));
    }

    @Test
    public void test_retrieve_publication_by_id(){
        String id = "test_id_Publication";
        Model temp = ModelFactory.createDefaultModel();
        temp.add(testPublicationStmt);
        repository.addData(temp);
        Model testModel = repository.retrievePublicationById(id);
        assertTrue(testModel.contains(testPublicationStmt));
    }

    @Test
    public void test_patch() throws Exception{
        List<Patch> list = new ArrayList<Patch>();
        Statement s1 = ResourceFactory.createStatement(
                ResourceFactory.createResource("http://example.com/a"), 
                ResourceFactory.createProperty("http://example.com/ontology/name"),
                ResourceFactory.createPlainLiteral("Test"));
        Patch patch1 = new Patch("add",s1,null);
        list.add(patch1);
        repository.patch(list);
        assertTrue(repository.askIfStatementExists(s1));
        Patch patch2 = new Patch("del",s1,null);
        List<Patch> list2 = new ArrayList<Patch>();
        list2.add(patch2);
        repository.patch(list2);
        assertFalse(repository.askIfStatementExists(s1));
    }
}
