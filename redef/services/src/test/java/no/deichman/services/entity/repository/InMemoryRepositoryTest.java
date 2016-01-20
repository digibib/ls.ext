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
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.Statement;
import org.apache.jena.riot.Lang;
import org.junit.Before;
import org.junit.Test;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import static com.google.common.collect.Lists.newArrayList;
import static org.apache.jena.rdf.model.ResourceFactory.createPlainLiteral;
import static org.apache.jena.rdf.model.ResourceFactory.createProperty;
import static org.apache.jena.rdf.model.ResourceFactory.createResource;
import static org.apache.jena.rdf.model.ResourceFactory.createStatement;
import static org.apache.jena.vocabulary.RDF.type;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

public class InMemoryRepositoryTest {
    public static final String A_BIBLIO_NO = "34567";
    public static final String WORK_ID = "test_id_1234";
    public static final String PUBLICATION_ID = "test_id_12345";
    private static final BaseURI BASE_URI = BaseURI.local();
    private static final Property NAME = createProperty(BASE_URI.ontology("name"));
    private static final String UNRECOGNISED_TYPE_ERROR = "The type wasn't recognised";
    private static final String PERSON = "Person";
    private static final String PLACE_OF_PUBLICATION = "PlaceOfPublication";
    private InMemoryRepository repository;
    private Statement workHasNameStmt;
    private Statement publHasANameStmt;
    private List<Statement> workWithPublicationStatements;
    private Statement workIsAWorkStmt;
    private Statement publIsAPublicationStmt;
    private Statement publIsAPublicationOfWorkStmt;
    private String publicationUri = BASE_URI.publication() + PUBLICATION_ID;
    private String workUri = BASE_URI.work() + WORK_ID;
    private String work = BASE_URI.ontology() + "Work";
    private String publicationTypeUri = BASE_URI.ontology() + "Publication";
    private String publicationOf = BASE_URI.ontology() + "publicationOf";

    @Before
    public void setup(){
        repository = new InMemoryRepository(BASE_URI);
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
        String publication = "{\"@context\": {\"dcterms\": \"http://purl.org/dc/terms/\",\"deichman\": \"http://deichman.no/ontology#\"},\"@graph\": {\"@id\": \"http://deichman.no/ublication/publication_SHOULD_EXIST\",\"@type\": \"deichman:Work\",\"dcterms:identifier\":\"publication_SERVICE_CREATE_WORK\",\"deichman:biblio\":\"1\"}}";
        final Model inputModel = RDFModelUtil.modelFrom(publication, Lang.JSONLD);
        assertNotNull(repository.createPublication(inputModel, A_BIBLIO_NO));
    }

    @Test
    public void test_publication_has_record_id() throws Exception {
        String publication = "{\"@context\": {\"dcterms\": \"http://purl.org/dc/terms/\",\"deichman\": \"http://deichman.no/ontology#\"},\"@graph\": {\"@id\": \"http://deichman.no/publication/publication_SHOULD_EXIST\",\"@type\": \"deichman:Work\",\"dcterms:identifier\":\"publication_SERVICE_CREATE_WORK\",\"deichman:biblio\":\"1\"}}";
        final Model inputModel = RDFModelUtil.modelFrom(publication, Lang.JSONLD);
        String publicationId = repository.createPublication(inputModel, A_BIBLIO_NO);
        Query query = QueryFactory.create("ASK {<" + publicationId + "> <" + BASE_URI.ontology() + "recordID> ?value .}");
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
    public void test_retrieve_work_by_id(){
        repository.addData(ModelFactory.createDefaultModel().add(workWithPublicationStatements));
        Model testModel = repository.retrieveWorkByURI(workUri);
        assertTrue("Work <" + workUri + "> should be a Work", testModel.contains(workIsAWorkStmt));
        assertTrue("Work <" + workUri + "> should should have name", testModel.contains(workHasNameStmt));
    }

    @Test
    public void test_retrieve_work_by_id2(){
        Model temp = ModelFactory.createDefaultModel();
        temp.add(workWithPublicationStatements);
        repository.addData(temp);
        Model testModel = repository.retrieveWorkAndLinkedResourcesByURI(workUri);
        List<Statement> missing = workWithPublicationStatements.stream()
                .filter(stmt -> !testModel.contains(stmt))
                .collect(Collectors.<Statement>toList());
        assertTrue("oups, some statements are missing: " + missing, missing.isEmpty());
    }

    @Test
    public void test_retrieve_publication_by_id(){
        Model temp = ModelFactory.createDefaultModel();
        temp.add(publHasANameStmt);
        repository.addData(temp);
        Model testModel = repository.retrievePublicationByURI(publicationUri);
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

    @Test
    public void test_get_person_resource_URI_by_Bibliofil_id() {
        String personId = "n12345";
        String person = setUpBibliofilImportedTestNTriples(PERSON, personId);
        Optional personExists = queryBibliofilResource(PERSON, personId);
        assertEquals("Expected person ID to result in URI match", person, personExists.get());
    }

    @Test
    public void test_get_place_of_publication_resource_URI_by_bibliofil_id() {
        String placeOfPublicationId = "n12345";
        String placeOfPublication = setUpBibliofilImportedTestNTriples(PERSON, placeOfPublicationId);
        Optional personExists = queryBibliofilResource(PERSON, placeOfPublicationId);
        assertEquals("Expected person ID to result in URI match", placeOfPublication, personExists.get());
    }

    private Optional queryBibliofilResource(String type, String identifier) {
        Optional exists;
        switch (type) {
            case "Person": exists = repository.getResourceURIByBibliofilId(identifier);
                break;
            case "PlaceOfPublication": exists = repository.getPlaceOfPublicationResourceURIByBibliofilId(identifier);
                break;
            default: exists = Optional.of(UNRECOGNISED_TYPE_ERROR);
                break;
        }

        if (exists.isPresent() && exists.get() == UNRECOGNISED_TYPE_ERROR) {
            throw new Error(UNRECOGNISED_TYPE_ERROR);
        }

        return exists;
    }

    private String setUpBibliofilImportedTestNTriples(String type, String identifier) {
        String testData = "<#> <http://data.deichman.no/duo#bibliofil" + type + "Id> \"" + identifier + "\" .";
        Model model = RDFModelUtil.modelFrom(testData, Lang.NTRIPLES);

        String retVal = null;

        switch (type) {
            case PERSON: retVal = repository.createPerson(model);
                break;
            case PLACE_OF_PUBLICATION: retVal = repository.createPlaceOfPublication(model);
                break;
            default: retVal = UNRECOGNISED_TYPE_ERROR;
                break;
        }

        if (retVal == UNRECOGNISED_TYPE_ERROR) {
            throw new Error(UNRECOGNISED_TYPE_ERROR);
        }

        return retVal;
    }

    public static InMemoryRepository repositoryWithDataFrom(String fileName) {
        final InMemoryRepository repository = new InMemoryRepository();
        Model testDataModel = ModelFactory.createDefaultModel();
        testDataModel.read(fileName, "TURTLE");
        repository.addData(testDataModel);
        return repository;
    }


}
