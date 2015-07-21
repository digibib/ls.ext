package no.deichman.services.resources;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URISyntaxException;
import java.nio.charset.StandardCharsets;

import javax.ws.rs.BadRequestException;
import javax.ws.rs.NotFoundException;
import javax.ws.rs.core.Response;

import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFDataMgr;
import org.codehaus.jackson.JsonParser;
import org.codehaus.jackson.map.ObjectMapper;
import org.junit.Before;
import org.junit.Test;

import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;
import com.hp.hpl.jena.rdf.model.ResourceFactory;

import no.deichman.services.kohaadapter.KohaAdapterMock;
import no.deichman.services.repository.RepositoryInMemory;
import no.deichman.services.uridefaults.BaseURIMock;

public class PublicationResourceTest {

    private PublicationResource resource;

    @Before
    public void setUp() throws Exception {
        resource = new PublicationResource(new KohaAdapterMock(), new RepositoryInMemory(), new BaseURIMock());
    }

    @Test
    public void test_class_exists(){
        assertNotNull(new PublicationResource());
    }

    @Test
    public void should_return_201_when_publication_created() throws URISyntaxException{
        String publication = "{\"@context\": {\"dcterms\": \"http://purl.org/dc/terms/\",\"deichman\": \"http://deichman.no/ontology#\"},\"@graph\": {\"@id\": \"http://deichman.no/publication/publication_SHOULD_EXIST\",\"@type\": \"deichman:Publication\",\"dcterms:identifier\":\"publication_SHOULD_EXIST\"}}";

        Response result = resource.createPublication(publication);

        assertNull(result.getEntity());
        assertEquals(201, result.getStatus());
    }

    @Test
    public void should_return_the_new_publication() throws URISyntaxException{
        String publication = "{\"@context\": {\"dcterms\": \"http://purl.org/dc/terms/\",\"deichman\": \"http://deichman.no/ontology#\"},\"@graph\": {\"@id\": \"http://deichman.no/publication/publication_SHOULD_EXIST\",\"@type\": \"deichman:Publication\",\"dcterms:identifier\":\"publication_SHOULD_EXIST\"}}";

        Response createResponse = resource.createPublication(publication);

        String publicationId = createResponse.getHeaderString("Location").replaceAll("http://deichman.no/publication/", "");

        Response result = resource.getPublicationJSON(publicationId);

        assertNotNull(result);
        assertEquals(201, createResponse.getStatus());
        assertEquals(200, result.getStatus());
        assertTrue(isValidJSON(result.getEntity().toString()));
    }

    @Test
    public void test_delete_publication() throws URISyntaxException{
        String publication = "{\"@context\": {\"dcterms\": \"http://purl.org/dc/terms/\",\"deichman\": \"http://deichman.no/ontology#\"},\"@graph\": {\"@id\": \"http://deichman.no/publication/publication_SHOULD_BE_PATCHABLE\",\"@type\": \"deichman:Publication\",\"dcterms:identifier\":\"publication_SHOULD_BE_PATCHABLE\"}}";
        Response createResponse = resource.createPublication(publication);
        String publicationId = createResponse.getHeaderString("Location").replaceAll("http://deichman.no/publication/", "");
        Response response = resource.deletePublication(publicationId);
        assertEquals(response.getStatus(),204);
    }

    @Test
    public void test_CORS_publication_base(){
        String reqHeader = "application/ld+json";
        Response reponse = resource.corsPublicationBase(reqHeader);
        assertEquals(reponse.getHeaderString("Access-Control-Allow-Headers"),reqHeader);
        assertEquals(reponse.getHeaderString("Access-Control-Allow-Origin"),"*");
        assertEquals(reponse.getHeaderString("Access-Control-Allow-Methods"),"GET, POST, OPTIONS, PUT, PATCH");
    }

    @Test
    public void test_CORS_publication_base_empty_request_header(){
        String reqHeader = "";
        Response response = resource.corsPublicationBase(reqHeader);
        assert(response.getHeaderString("Access-Control-Allow-Headers") == null);
        assertEquals(response.getHeaderString("Access-Control-Allow-Origin"),"*");
        assertEquals(response.getHeaderString("Access-Control-Allow-Methods"),"GET, POST, OPTIONS, PUT, PATCH");
    }

    @Test
    public void test_CORS_publication_id(){
        String reqHeader = "application/ld+json";
        Response reponse = resource.corsPublicationId(reqHeader);
        assertEquals(reponse.getHeaderString("Access-Control-Allow-Headers"),reqHeader);
        assertEquals(reponse.getHeaderString("Access-Control-Allow-Origin"),"*");
        assertEquals(reponse.getHeaderString("Access-Control-Allow-Methods"),"GET, POST, OPTIONS, PUT, PATCH");
    }

    @Test
    public void patch_should_return_status_400() throws Exception {
        String publication = "{\"@context\": {\"dcterms\": \"http://purl.org/dc/terms/\",\"deichman\": \"http://deichman.no/ontology#\"},\"@graph\": {\"@id\": \"http://deichman.no/publication/publication_SHOULD_BE_PATCHABLE\",\"@type\": \"deichman:Publication\",\"dcterms:identifier\":\"publication_SHOULD_BE_PATCHABLE\"}}";
        Response result = resource.createPublication(publication);
        String publicationId = result.getLocation().getPath().substring(13);
        String patchData = "{}";
        try {
            resource.patchPublication(publicationId,patchData);
            fail("HTTP 400 Bad Request");
        } catch (BadRequestException bre) {
            assertEquals("HTTP 400 Bad Request", bre.getMessage());
        }
    }

    @Test
    public void patched_publication_should_persist_changes() throws Exception {
        String publication = "{\"@context\": {\"dcterms\": \"http://purl.org/dc/terms/\",\"deichman\": \"http://deichman.no/ontology#\"},\"@graph\": {\"@id\": \"http://deichman.no/publication/publication_SHOULD_BE_PATCHABLE\",\"@type\": \"deichman:Publication\",\"dcterms:identifier\":\"publication_SHOULD_BE_PATCHABLE\"}}";
        Response result = resource.createPublication(publication);
        String publicationId = result.getLocation().getPath().substring(13);
        String patchData = "{"
                + "\"op\": \"add\","
                + "\"s\": \"" + result.getLocation().toString() + "\","
                + "\"p\": \"http://deichman.no/ontology#color\","
                + "\"o\": {"
                + "\"value\": \"red\""
                + "}"
                + "}";
        Response patchResponse = resource.patchPublication(publicationId,patchData);
        Model testModel = ModelFactory.createDefaultModel();
        Model comparison = ModelFactory.createDefaultModel();
        String response = patchResponse.getEntity().toString();
        InputStream in = new ByteArrayInputStream(response.getBytes(StandardCharsets.UTF_8));
        RDFDataMgr.read(testModel, in, Lang.JSONLD);
        String adaptedPublication = publication.replace("/publication_SHOULD_BE_PATCHABLE", "/" + publicationId);
        InputStream in2 = new ByteArrayInputStream(adaptedPublication.getBytes(StandardCharsets.UTF_8));
        RDFDataMgr.read(comparison,in2, Lang.JSONLD);
        comparison.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(result.getLocation().toString()), 
                ResourceFactory.createProperty("http://deichman.no/ontology#color"), 
                ResourceFactory.createPlainLiteral("red")));
        assertTrue(testModel.isIsomorphicWith(comparison));
    }

    @Test(expected = NotFoundException.class)
    public void patching_a_non_existing_resource_should_return_404() throws Exception {
        resource.patchPublication("a_missing_publication1234", "{}");
    }

    private boolean isValidJSON(final String json) {
        boolean valid = false;
        try {
            final JsonParser parser = new ObjectMapper().getJsonFactory().createJsonParser(json);
            while (parser.nextToken() != null) {
            }
            valid = true;
        } catch (IOException ioe) {
            ioe.printStackTrace();
        }

        return valid;
    }
}
