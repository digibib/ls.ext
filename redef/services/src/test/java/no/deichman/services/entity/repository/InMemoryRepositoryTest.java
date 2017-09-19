package no.deichman.services.entity.repository;

import no.deichman.services.entity.EntityType;
import no.deichman.services.entity.patch.Patch;
import no.deichman.services.rdf.RDFModelUtil;
import no.deichman.services.uridefaults.BaseURI;
import no.deichman.services.uridefaults.XURI;
import org.apache.commons.io.IOUtils;
import org.apache.jena.query.Query;
import org.apache.jena.query.QueryExecution;
import org.apache.jena.query.QueryExecutionFactory;
import org.apache.jena.query.QueryFactory;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.Statement;
import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFDataMgr;
import org.junit.Before;
import org.junit.Test;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import static com.google.common.collect.ImmutableMap.of;
import static com.google.common.collect.Lists.newArrayList;
import static org.apache.jena.rdf.model.ResourceFactory.createPlainLiteral;
import static org.apache.jena.rdf.model.ResourceFactory.createProperty;
import static org.apache.jena.rdf.model.ResourceFactory.createResource;
import static org.apache.jena.rdf.model.ResourceFactory.createStatement;
import static org.apache.jena.vocabulary.RDF.type;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

public class InMemoryRepositoryTest {
    public static final String A_BIBLIO_NO = "34567";
    public static final String WORK_ID = "w12340000";
    public static final String PUBLICATION_ID = "p000111000";
    private static final Property NAME = createProperty(BaseURI.ontology("name"));
    private InMemoryRepository repository;
    private Statement workHasNameStmt;
    private Statement publHasANameStmt;
    private List<Statement> workWithPublicationStatements;
    private Statement workIsAWorkStmt;
    private Statement publIsAPublicationStmt;
    private Statement publIsAPublicationOfWorkStmt;
    private String publicationUri = BaseURI.publication() + PUBLICATION_ID;
    private String workUri = BaseURI.work() + WORK_ID;
    private String work = BaseURI.ontology("Work");
    private String publicationTypeUri = BaseURI.ontology("Publication");
    private String publicationOf = BaseURI.ontology("publicationOf");

    @Before
    public void setup(){
        repository = new InMemoryRepository();
        workIsAWorkStmt = createStatement(createResource(workUri), type, createResource(work));
        workHasNameStmt = createStatement(createResource(workUri), NAME, createPlainLiteral("Test"));
        publIsAPublicationStmt = createStatement(createResource(publicationUri), type, createResource(publicationTypeUri));
        publHasANameStmt = createStatement(createResource(publicationUri), NAME, createPlainLiteral("Test"));
        publIsAPublicationOfWorkStmt = createStatement(createResource(publicationUri), createProperty(publicationOf),
                createResource(workUri));

        workWithPublicationStatements = newArrayList(
                workIsAWorkStmt,
                workHasNameStmt,
                publHasANameStmt,
                publIsAPublicationStmt,
                publIsAPublicationOfWorkStmt
        );
    }

    @Test
    public void test_it_exists(){
        assertNotNull(new InMemoryRepository());
    }

    @Test
    public void test_create_publication() throws Exception{
        String publication = "{\"@context\": {\"dcterms\": \"http://purl.org/dc/terms/\",\"deichman\": \"http://data.deichman.no/ontology#\"},\"@graph\": {\"@id\": \"http://data.deichman.no/ublication/publication_SHOULD_EXIST\",\"@type\": \"deichman:Work\",\"dcterms:identifier\":\"publication_SERVICE_CREATE_WORK\",\"deichman:biblio\":\"1\"}}";
        final Model inputModel = RDFModelUtil.modelFrom(publication, Lang.JSONLD);
        assertNotNull(repository.createPublication(inputModel, A_BIBLIO_NO));
    }

    @Test
    public void test_publication_has_record_id() throws Exception {
        String publication = "{\"@context\": {\"dcterms\": \"http://purl.org/dc/terms/\",\"deichman\": \"http://data.deichman.no/ontology#\"},\"@graph\": {\"@id\": \"http://data.deichman.no/publication/publication_SHOULD_EXIST\",\"@type\": \"deichman:Work\",\"dcterms:identifier\":\"publication_SERVICE_CREATE_WORK\",\"deichman:biblio\":\"1\"}}";
        final Model inputModel = RDFModelUtil.modelFrom(publication, Lang.JSONLD);
        String publicationId = repository.createPublication(inputModel, A_BIBLIO_NO);
        Query query = QueryFactory.create("ASK {<" + publicationId + "> <" + BaseURI.ontology("recordId") + "> ?value .}");
        QueryExecution qexec = QueryExecutionFactory.create(query,repository.getModel());
        assertTrue(qexec.execAsk());
    }
    @Test
    public void test_add_data(){
        Model testModel = ModelFactory.createDefaultModel();
        Statement s = createStatement(
                createResource("http://example.com/a"),
                NAME,
                createPlainLiteral("Test"));
        repository.addData(testModel);
        assertFalse(repository.askIfStatementExists(s));
        testModel.add(s);
        repository.addData(testModel);
        assertTrue(repository.askIfStatementExists(s));
    }

    @Test
    public void test_retrieve_work_by_id() throws Exception {
        repository.addData(ModelFactory.createDefaultModel().add(workWithPublicationStatements));
        Model testModel = repository.retrieveResourceByURI(new XURI(workUri), true);
        assertTrue("Work <" + workUri + "> should be a Work", testModel.contains(workIsAWorkStmt));
        assertTrue("Work <" + workUri + "> should should have name", testModel.contains(workHasNameStmt));
    }

    @Test
    public void test_retrieve_work_by_id2() throws Exception {
        Model temp = ModelFactory.createDefaultModel();
        temp.add(workWithPublicationStatements);
        repository.addData(temp);
        Model testModel = repository.retrieveWorkAndLinkedResourcesByURI(new XURI(workUri));
        List<Statement> missing = workWithPublicationStatements.stream()
                .filter(stmt -> !testModel.contains(stmt))
                .collect(Collectors.<Statement>toList());
        assertTrue("oups, some statements are missing: " + missing, missing.isEmpty());
    }

    @Test
    public void test_retrieve_publication_by_id() throws Exception {
        Model temp = ModelFactory.createDefaultModel();
        temp.add(publHasANameStmt);
        repository.addData(temp);
        Model testModel = repository.retrieveResourceByURI(new XURI(publicationUri),true);
        assertTrue(testModel.contains(publHasANameStmt));
    }

    @Test
    public void test_patch() throws Exception{
        List<Patch> list = new ArrayList<Patch>();
        Statement s1 = createStatement(
                createResource("http://example.com/a"),
                NAME,
                createPlainLiteral("Test"));
        Patch patch1 = new Patch("add",s1,null);
        list.add(patch1);
        repository.patch(list, RDFRepositoryBase.PLACEHOLDER_RESOURCE);
        assertTrue(repository.askIfStatementExists(s1));
        Patch patch2 = new Patch("del",s1,null);
        List<Patch> list2 = new ArrayList<Patch>();
        list2.add(patch2);
        repository.patch(list2, RDFRepositoryBase.PLACEHOLDER_RESOURCE);
        assertFalse(repository.askIfStatementExists(s1));
    }

    @Test
    public void shouldReturnThatIDisAvailable() throws Exception {
        XURI test = new XURI("http://data.deichman.no/work/w00009");
        assertFalse(repository.askIfResourceExists(test));
    }

    @Test
    public void shouldReturnThatIDisNotAvailable() throws Exception {
        repository = repositoryWithDataFrom("testdata.ttl");
        XURI test = new XURI("http://data.deichman.no/work/w00001");
        assertTrue(repository.askIfResourceExists(test));
    }

    @Test
    public void shouldReturnIdOfPublicationsLinkedToWork() throws Exception {
        repository = repositoryWithDataFrom("work_w87654.ttl");
        XURI test = new XURI("http://data.deichman.no/work/w87654");
        List<String> data = repository.retrieveRecordIdsByWork(test);
        assertTrue(data.contains("80001"));
    }

    @Test
    public void shouldNotReturnBlacklistedPredicates() throws Exception {
        repository = repositoryWithDataFrom("work_w87654.ttl");
        XURI test = new XURI("http://data.deichman.no/publication/p80002");
        Model data = repository.retrieveResourceByURI(test, true);
        assertFalse(data.toString().contains("359"));
        assertFalse(data.toString().contains("360"));
    }

    @Test
    public void shouldReturnMainTitleOfPublicationByISBN() throws Exception {
        repository = repositoryWithDataFrom("work_w87654.ttl");
        Model data = repository.retrieveResourceByQuery(EntityType.PUBLICATION, of("isbn", "978-82-02-48040-0"), newArrayList("mainTitle", "subtitle"));
        assertTrue(data.toString().contains("Hey nonny nonny"));
        assertTrue(data.toString().contains("Much ado about nothing"));
        assertFalse(data.toString().contains("80001"));
    }

    @Test
    public void shouldReturnPublicationByParsedCoreISBN() throws Exception {
        repository = repositoryWithDataFrom("work_w87654.ttl");
        Model pub1 = repository.describePublicationFromParsedCoreISBNQuery("978-82-02-48040-0");
        Model pub2 = repository.describePublicationFromParsedCoreISBNQuery("9-7-88-2-02-4804-0-4");
        Model pub3 = repository.describePublicationFromParsedCoreISBNQuery("82-02-48040-X");
        Model pub4 = repository.describePublicationFromParsedCoreISBNQuery("123-555-6767");
        assertTrue(pub1.toString().equals(pub2.toString()));
        assertTrue(pub2.toString().equals(pub3.toString()));
        assertFalse(pub1.toString().equals(pub4.toString()));
    }

    public static InMemoryRepository repositoryWithDataFrom(String fileName) {
        final InMemoryRepository repository = new InMemoryRepository();
        Model testDataModel = ModelFactory.createDefaultModel();
        testDataModel.read(fileName, "TURTLE");
        repository.addData(testDataModel);
        return repository;
    }

    public static InMemoryRepository repositoryWithDataFromString(String string, Lang lang) {
        final InMemoryRepository repository = new InMemoryRepository();
        Model testDataModel = ModelFactory.createDefaultModel();
        RDFDataMgr.read(testDataModel, IOUtils.toInputStream(string), lang);
        repository.addData(testDataModel);
        return repository;
    }

}
