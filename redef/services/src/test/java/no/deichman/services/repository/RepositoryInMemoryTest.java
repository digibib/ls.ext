package no.deichman.services.repository;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import java.util.ArrayList;
import java.util.List;

import org.junit.Before;
import org.junit.Test;

import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;
import com.hp.hpl.jena.rdf.model.ResourceFactory;
import com.hp.hpl.jena.rdf.model.Statement;
import com.hp.hpl.jena.sparql.core.DatasetImpl;

import no.deichman.services.patch.Patch;
import no.deichman.services.uridefaults.BaseURIMock;

public class RepositoryInMemoryTest {
    private RepositoryInMemory repository;
    private BaseURIMock bud;
    private Statement testStmt;

    @Before
    public void setup(){
        repository = new RepositoryInMemory();
        bud = new BaseURIMock();
        testStmt = ResourceFactory.createStatement(
                        ResourceFactory.createResource(bud.getWorkURI() + "test_id_123"), 
                        ResourceFactory.createProperty("http://example.com/ontology/name"),
                        ResourceFactory.createPlainLiteral("Test"));
    }

    @Test
    public void test_it_exists(){
        assertNotNull(new RepositoryInMemory());
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
        temp.add(testStmt);
        repository.addData(temp);
        Model testModel = repository.retrieveWorkById(id);
        assertTrue(testModel.contains(testStmt));
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
