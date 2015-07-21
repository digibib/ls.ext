package no.deichman.services.resources;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;

import java.io.IOException;
import java.net.URISyntaxException;

import javax.ws.rs.core.Response;

import org.codehaus.jackson.JsonParser;
import org.codehaus.jackson.map.ObjectMapper;
import org.junit.Before;
import org.junit.Test;

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
        String publication = "{\"@context\": {\"dcterms\": \"http://purl.org/dc/terms/\",\"deichman\": \"http://deichman.no/ontology#\"},\"@graph\": {\"@id\": \"http://deichman.no/publication/publication_SHOULD_EXIST\",\"@type\": \"deichman:Publication\",\"dcterms:identifier\":\"work_SHOULD_EXIST\"}}";

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
