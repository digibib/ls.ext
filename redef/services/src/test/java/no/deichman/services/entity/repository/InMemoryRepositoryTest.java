package no.deichman.services.entity.repository;

import no.deichman.services.entity.patch.Patch;
import no.deichman.services.rdf.RDFModelUtil;
import no.deichman.services.uridefaults.BaseURI;
import org.apache.jena.query.Query;
import org.apache.jena.query.QueryExecution;
import org.apache.jena.query.QueryExecutionFactory;
import org.apache.jena.query.QueryFactory;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.rdf.model.ResourceFactory;
import org.apache.jena.rdf.model.Statement;
import org.apache.jena.riot.Lang;
import org.apache.jena.vocabulary.RDF;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

public class InMemoryRepositoryTest {
    public static final String A_BIBLIO_NO = "34567";
    private InMemoryRepository repository;
    private Statement testWorkStmt;
    private Statement testPublicationStmt;
    private List<Statement> stmts;
    private BaseURI baseURI;

    @Before
    public void setup(){
        repository = new InMemoryRepository();
        baseURI = BaseURI.local();
        testWorkStmt = ResourceFactory.createStatement(
                        ResourceFactory.createResource(baseURI.work() + "test_id_123"),
                        ResourceFactory.createProperty("http://example.com/ontology/name"),
                        ResourceFactory.createPlainLiteral("Test"));
        testPublicationStmt = ResourceFactory.createStatement(
                ResourceFactory.createResource(baseURI.publication() + "test_id_Publication"),
                ResourceFactory.createProperty("http://example.com/ontology/name"),
                ResourceFactory.createPlainLiteral("Test"));
        Statement testWork0 = ResourceFactory.createStatement(
                ResourceFactory.createResource(baseURI.work() + "test_id_1234"),
                RDF.type,
                ResourceFactory.createResource(baseURI.ontology() + "Work"));
        Statement testWork1 = ResourceFactory.createStatement(
                ResourceFactory.createResource(baseURI.publication() + "test_id_12345"),
                RDF.type,
                ResourceFactory.createResource(baseURI.ontology() + "Publication"));
        Statement testWork2 = ResourceFactory.createStatement(
                ResourceFactory.createResource(baseURI.publication() + "test_id_12345"),
                ResourceFactory.createProperty(baseURI.ontology() + "publicationOf"),
                ResourceFactory.createResource(baseURI.work() + "test_id_1234"));
        stmts  = new ArrayList<Statement>();
        stmts.add(testWork0);
        stmts.add(testWork1);
        stmts.add(testWork2);
    }

    @Test
    public void test_it_exists(){
        assertNotNull(new InMemoryRepository());
    }

    @Test
    public void test_create_publication() throws Exception{
        String publication = "{\"@context\": {\"dcterms\": \"http://purl.org/dc/terms/\",\"deichman\": \"http://deichman.no/ontology#\"},\"@graph\": {\"@id\": \"http://deichman.no/publication/publication_SHOULD_EXIST\",\"@type\": \"deichman:Work\",\"dcterms:identifier\":\"publication_SERVICE_CREATE_WORK\",\"deichman:biblio\":\"1\"}}";
        final Model inputModel = RDFModelUtil.modelFrom(publication, Lang.JSONLD);
        assertNotNull(repository.createPublication(inputModel, A_BIBLIO_NO));
    }

    @Test
    public void test_publication_has_record_id() throws Exception {
        String publication = "{\"@context\": {\"dcterms\": \"http://purl.org/dc/terms/\",\"deichman\": \"http://deichman.no/ontology#\"},\"@graph\": {\"@id\": \"http://deichman.no/publication/publication_SHOULD_EXIST\",\"@type\": \"deichman:Work\",\"dcterms:identifier\":\"publication_SERVICE_CREATE_WORK\",\"deichman:biblio\":\"1\"}}";
        final Model inputModel = RDFModelUtil.modelFrom(publication, Lang.JSONLD);
        String publicationId = repository.createPublication(inputModel, A_BIBLIO_NO);
        Query query = QueryFactory.create("ASK {<" + publicationId + "> <" + baseURI.ontology() + "recordID> ?value .}");
        QueryExecution qexec = QueryExecutionFactory.create(query,repository.getModel());
        assertTrue(qexec.execAsk());
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
    public void test_retrieve_work_by_id(){
        String id = "test_id_123";
        Model temp = ModelFactory.createDefaultModel();
        temp.add(testWorkStmt);
        repository.addData(temp);
        Model testModel = repository.retrieveWorkById(id);
        assertTrue(testModel.contains(testWorkStmt));
    }

    @Test @Ignore("Fails ... must be addressed by RDF hero")
    public void test_retrieve_work_by_id2(){
        String id = "test_id_1234";
        Model temp = ModelFactory.createDefaultModel();
        temp.add(stmts);
        repository.addData(temp);
        Model testModel = repository.retrieveWorkById(id);
        List<Statement> missing = stmts.stream()
                .filter(stmt -> !testModel.contains(stmt))
                .collect(Collectors.<Statement>toList());
        assertTrue("oups, some statements are missing: " + missing, missing.isEmpty());
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

    @Test
    public void shouldReturnThatIDisAvailable() {
        String test = "http://deichman.no/work/work_00009";
        assertFalse(repository.askIfResourceExists(test));
    }

    @Test
    public void shouldReturnThatIDisNotAvailable() {
        repository = repositoryWithDataFrom("testdata.ttl");
        String test = "http://deichman.no/work/work_00001";
        assertTrue(repository.askIfResourceExists(test));
    }

    public static InMemoryRepository repositoryWithDataFrom(String fileName) {
        final InMemoryRepository repository = new InMemoryRepository();
        Model testDataModel = ModelFactory.createDefaultModel();
        testDataModel.read(fileName, "TURTLE");
        repository.addData(testDataModel);
        return repository;
    }


}
