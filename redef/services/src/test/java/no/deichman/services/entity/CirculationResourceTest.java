package no.deichman.services.entity;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonParser;
import no.deichman.services.entity.kohaadapter.KohaAPIMock;
import no.deichman.services.entity.kohaadapter.KohaAdapter;
import no.deichman.services.entity.repository.InMemoryRepository;
import no.deichman.services.uridefaults.BaseURI;
import no.deichman.services.uridefaults.XURI;
import org.apache.jena.datatypes.xsd.XSDDatatype;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdf.model.ResourceFactory;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.junit.MockitoJUnitRunner;

import java.util.Random;
import java.util.concurrent.ThreadLocalRandom;

import static java.lang.String.format;
import static no.deichman.services.entity.ExpectationTest.BOK;
import static org.apache.jena.rdf.model.ResourceFactory.createProperty;
import static org.apache.jena.rdf.model.ResourceFactory.createResource;
import static org.apache.jena.rdf.model.ResourceFactory.createStatement;
import static org.apache.jena.vocabulary.RDF.type;
import static org.junit.Assert.assertEquals;
import static org.mockito.Matchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import static org.junit.Assert.assertNotNull;

/**
 * Responsibility: Test circulation resource class.
 */
@RunWith(MockitoJUnitRunner.class)
public class CirculationResourceTest {

    private static final String ITEM_NUMBER_1 = "65443";
    private static final String RECORD_ID_1 = "54312";
    private static final String USER_ID = "1001";
    private static final String RECORD_ID_2 = "99232";
    private static final int ORIGIN = 1000;
    private static final String RECORD_ID_3 = "220";
    private static final int BOUND = 50000;
    private static final Gson GSON = new GsonBuilder().setPrettyPrinting().serializeNulls().create();

    private KohaAdapter mockKohaAdapter = mock(KohaAdapter.class);
    private EntityServiceImpl service;

    @Before
    public void setUp() throws Exception {
        service = new EntityServiceImpl(new InMemoryRepository(), mockKohaAdapter);
    }

    @Test
    public void it_exists() {
        assertNotNull(new CirculationResource());
    }

    @Test
    public void it_returns_data() throws Exception {

        CirculationResource circulationResource = new CirculationResource(service, null, mockKohaAdapter);
        KohaAPIMock kohaAPIMock = new KohaAPIMock();
        String checkoutData = kohaAPIMock.generateCheckoutsJson(USER_ID, ITEM_NUMBER_1);
        String holdsData = kohaAPIMock.generateHoldsJson(USER_ID, RECORD_ID_2, RECORD_ID_3);
        String record1 = kohaAPIMock.generateBiblio(RECORD_ID_1, BOK);
        String recordExpanded1 = kohaAPIMock.generateBiblioExpanded(RECORD_ID_2, BOK, false, 2, 2);

        when(mockKohaAdapter.getCheckouts(USER_ID)).thenReturn(checkoutData);
        when(mockKohaAdapter.getHolds(USER_ID)).thenReturn(holdsData);
        when(mockKohaAdapter.getBiblioFromItemNumber(ITEM_NUMBER_1)).thenReturn(record1);
        when(mockKohaAdapter.createNewBiblioWithMarcRecord(any())).thenReturn(RECORD_ID_1, RECORD_ID_2, RECORD_ID_3);
        when(mockKohaAdapter.retrieveBiblioExpanded(RECORD_ID_2)).thenReturn(recordExpanded1);

        XURI person = new XURI(preparePerson());
        XURI work = new XURI(prepareWork(person.getUri()));
        XURI publicationUri1 = new XURI(service.create(EntityType.PUBLICATION, prepareTripleStore(work.getUri())));
        XURI publicationUri2 = new XURI(service.create(EntityType.PUBLICATION, prepareTripleStore(work.getUri())));
        XURI publicationUri3 = new XURI(service.create(EntityType.PUBLICATION, prepareTripleStore(work.getUri())));

        String comparison = format("{\n"
                + "  \"loans\": [\n"
                + "    {\n"
                + "      \"itemNumber\": \"65443\",\n"
                + "      \"dueDate\": \"IT_DOES_NOT_MATTER\",\n"
                + "      \"recordId\": \"54312\",\n"
                + "      \"workURI\": \"http://data.deichman.no/work/%5$s\",\n"
                + "      \"publicationURI\": \"http://data.deichman.no/publication/%1$s\",\n"
                + "      \"publicationImage\": null,\n"
                + "      \"contributor\": {\n"
                + "        \"role\": \"http://data.deichman.no/role#author\",\n"
                + "        \"agentUri\": \"http://data.deichman.no/person/%4$s\",\n"
                + "        \"contributorNationality\": \"http://data.deichman.no/nationality#n\",\n"
                + "        \"contributorName\": \"Alfreda Furlong\"\n"
                + "      },\n"
                + "      \"mediaType\": \"http://data.deichman.no/mediaType#Book\",\n"
                + "      \"branchCode\": \"hutl\",\n"
                + "      \"title\": \"Tre mannfolk i en ballongkurv med gyngehest og parasoll\",\n"
                + "      \"publicationYear\": \"2005\",\n"
                + "      \"relativePublicationPath\": \"/work/%5$s/publication/%1$s\",\n"
                + "      \"id\": \"IT_DOES_NOT_MATTER\"\n"
                + "    }\n"
                + "  ],\n"
                + "  \"reservations\": [\n"
                + "    {\n"
                + "      \"suspended\": false,\n"
                + "      \"queuePlace\": \"1\",\n"
                + "      \"orderedDate\": \"IT_DOES_NOT_MATTER\",\n"
                + "      \"suspendUntil\": null,\n"
                + "      \"estimatedWait\": {"
                + "        \"pending\": false,"
                + "        \"estimate\": 5,"
                + "        \"error\": null"
                + "      },"
                + "      \"pickupNumber\": null,"
                + "      \"recordId\": \"99232\",\n"
                + "      \"workURI\": \"http://data.deichman.no/work/%5$s\",\n"
                + "      \"publicationURI\": \"http://data.deichman.no/publication/%2$s\",\n"
                + "      \"publicationImage\": null,\n"
                + "      \"contributor\": {\n"
                + "        \"role\": \"http://data.deichman.no/role#author\",\n"
                + "        \"agentUri\": \"http://data.deichman.no/person/%4$s\",\n"
                + "        \"contributorNationality\": \"http://data.deichman.no/nationality#n\",\n"
                + "        \"contributorName\": \"Alfreda Furlong\"\n"
                + "      },\n"
                + "      \"mediaType\": \"http://data.deichman.no/mediaType#Book\",\n"
                + "      \"branchCode\": \"hutl\",\n"
                + "      \"title\": \"Tre mannfolk i en ballongkurv med gyngehest og parasoll\",\n"
                + "      \"publicationYear\": \"2005\",\n"
                + "      \"relativePublicationPath\": \"/work/%5$s/publication/%2$s\",\n"
                + "      \"id\": \"IT_DOES_NOT_MATTER\"\n"
                + "    }\n"
                + "  ],\n"
                + "  \"pickups\": [\n"
                + "    {\n"
                + "      \"pickupNumber\": \"11/123\",\n"
                + "      \"expirationDate\": \"IT_DOES_NOT_MATTER\",\n"
                + "      \"recordId\": \"220\",\n"
                + "      \"workURI\": \"http://data.deichman.no/work/%5$s\",\n"
                + "      \"publicationURI\": \"http://data.deichman.no/publication/%3$s\",\n"
                + "      \"publicationImage\": null,\n"
                + "      \"contributor\": {\n"
                + "        \"role\": \"http://data.deichman.no/role#author\",\n"
                + "        \"agentUri\": \"http://data.deichman.no/person/%4$s\",\n"
                + "        \"contributorNationality\": \"http://data.deichman.no/nationality#n\",\n"
                + "        \"contributorName\": \"Alfreda Furlong\"\n"
                + "      },\n"
                + "      \"mediaType\": \"http://data.deichman.no/mediaType#Book\",\n"
                + "      \"branchCode\": \"hutl\",\n"
                + "      \"title\": \"Tre mannfolk i en ballongkurv med gyngehest og parasoll\",\n"
                + "      \"publicationYear\": \"2005\",\n"
                + "      \"relativePublicationPath\": \"/work/%5$s/publication/%3$s\",\n"
                + "      \"id\": \"IT_DOES_NOT_MATTER\"\n"
                + "    }\n"
                + "  ]\n"
                + "}", publicationUri1.getId(), publicationUri2.getId(), publicationUri3.getId(), person.getId(), work.getId());


        String response = circulationResource.get(USER_ID).getEntity().toString()
                .replaceAll("[0-9]{4}-[0-9]{2}-[0-9][^\"]+", "IT_DOES_NOT_MATTER")
                .replaceAll("\"id\": \"[0-9]+\"", "\"id\": \"IT_DOES_NOT_MATTER\"");

        String prettyComparisonData = GSON.toJson(new JsonParser().parse(comparison));
        assertEquals(prettyComparisonData, response);
    }

    private Model getRandomPerson() {
        Model model = ModelFactory.createDefaultModel();
        String name = "Alfreda Furlong";

        Resource person = createResource(BaseURI.person() + "p"+ ThreadLocalRandom.current().nextInt(ORIGIN, BOUND));
        model.add(createStatement(person, type, createResource(BaseURI.ontology() + "Person")));
        model.add(createStatement(person, ResourceFactory.createProperty(BaseURI.ontology() + "name"), ResourceFactory.createPlainLiteral(name)));
        model.add(createStatement(person, ResourceFactory.createProperty(BaseURI.ontology() + "nationality"),
                ResourceFactory.createProperty("http://data.deichman.no/nationality#n")));
        return model;
    }
    private String preparePerson() throws Exception {
        return service.create(EntityType.PERSON, getRandomPerson());

    }
    private String prepareWork(String contributorUri) throws Exception {
        Resource work = ResourceFactory.createResource(BaseURI.work() + "w" + new Random().nextInt(ORIGIN));
        Model workModel = ModelFactory.createDefaultModel();
        workModel.add(createStatement(
                work,
                type, ResourceFactory.createResource(BaseURI.ontology() + "Work")));
        Resource anon = ResourceFactory.createResource();

        workModel.add(createStatement(work, createProperty(BaseURI.ontology() + "contributor"), anon));
        workModel.add(createStatement(anon, type, createResource(BaseURI.ontology() + "Contribution")));
        workModel.add(createStatement(anon, type, createResource(BaseURI.ontology() + "MainEntry")));
        workModel.add(createStatement(anon, createProperty(BaseURI.ontology() + "agent"), createResource(contributorUri)));
        workModel.add(createStatement(anon, createProperty(BaseURI.ontology() + "role"), createResource(BaseURI.role() + "author")));

        return service.create(EntityType.WORK, workModel);
    }

    private Model prepareTripleStore(String workUri) throws Exception {
        Model publicationModel = ModelFactory.createDefaultModel();
        Resource subject = createResource(new XURI(BaseURI.root(),
                EntityType.PUBLICATION.getPath(), "p" + new Random().nextInt(ORIGIN)).getUri());
        publicationModel.add(createStatement(
                subject,
                ResourceFactory.createProperty(BaseURI.ontology() + "publicationOf"),
                ResourceFactory.createResource(workUri)));
        publicationModel.add(createStatement(
                subject,
                ResourceFactory.createProperty(BaseURI.ontology() + "mainTitle"),
                ResourceFactory.createPlainLiteral("Tre mannfolk i en ballongkurv med gyngehest og parasoll")));
        publicationModel.add(createStatement(
                subject,
                ResourceFactory.createProperty(BaseURI.ontology() + "mainTitle"),
                ResourceFactory.createPlainLiteral("Tre mannfolk i en ballongkurv med gyngehest og parasoll v2")));
        publicationModel.add(createStatement(
                subject,
                ResourceFactory.createProperty(BaseURI.ontology() + "publicationYear"),
                ResourceFactory.createTypedLiteral("2005", XSDDatatype.XSDgYear)));
        publicationModel.add(createStatement(subject, createProperty(BaseURI.ontology() + "hasMediaType"), createResource(BaseURI.root() + "mediaType#Book")));
        return publicationModel;
    }
}
