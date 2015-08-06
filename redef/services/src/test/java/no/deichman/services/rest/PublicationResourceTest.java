package no.deichman.services.rest;

import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;
import com.hp.hpl.jena.rdf.model.ResourceFactory;
import com.hp.hpl.jena.rdf.model.Statement;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import javax.ws.rs.BadRequestException;
import javax.ws.rs.NotFoundException;
import javax.ws.rs.core.Response;
import static javax.ws.rs.core.Response.Status.CREATED;
import static javax.ws.rs.core.Response.Status.NO_CONTENT;
import static javax.ws.rs.core.Response.Status.OK;
import no.deichman.services.kohaadapter.KohaAdapter;
import no.deichman.services.repository.RepositoryInMemory;
import no.deichman.services.service.ServiceImpl;
import no.deichman.services.uridefaults.BaseURI;
import no.deichman.services.uridefaults.BaseURIMock;
import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFDataMgr;
import org.codehaus.jackson.JsonParser;
import org.codehaus.jackson.map.ObjectMapper;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;

public class PublicationResourceTest {

    private PublicationResource resource;

    private String createTestPublicationJSON(String id) {
        return "{\"@context\": "
                + "{\"dcterms\": \"http://purl.org/dc/terms/\","
                + "\"deichman\": \"http://deichman.no/ontology#\"},"
                + "\"@graph\": "
                + "{\"@id\": \"http://deichman.no/publication/" + id + "\","
                + "\"@type\": \"deichman:Publication\","
                + "\"dcterms:identifier\":\"" + id + "\"}}";
    }

    @Before
    public void setUp() throws Exception {
        KohaAdapter notUsedHere = null;
        BaseURI baseURI = new BaseURIMock();
        ServiceImpl service = new ServiceImpl(baseURI, new RepositoryInMemory(), notUsedHere);
        resource = new PublicationResource(baseURI, service);
    }

    @Test
    public void should_have_default_constructor() {
        assertNotNull(new PublicationResource());
    }

    @Test @Ignore("Koha not properly mocked")
    public void should_return_201_when_publication_created() throws Exception{
        Response result = resource.createPublication(createTestPublicationJSON("publication_SHOULD_EXIST"));
        assertNull(result.getEntity());
        assertEquals(CREATED.getStatusCode(), result.getStatus());
    }

    @Test @Ignore("Koha not properly mocked")
    public void should_return_the_new_publication() throws Exception{
        Response createResponse = resource.createPublication(createTestPublicationJSON("publication_SHOULD_EXIST"));

        String publicationId = createResponse.getHeaderString("Location").replaceAll("http://deichman.no/publication/", "");

        Response result = resource.getPublicationJSON(publicationId);

        assertNotNull(result);
        assertEquals(CREATED.getStatusCode(), createResponse.getStatus());
        assertEquals(OK.getStatusCode(), result.getStatus());
        assertTrue(result.getEntity().toString().contains("\"deichman:recordID\""));
        assertTrue(isValidJSON(result.getEntity().toString()));
    }

    @Test @Ignore("Koha not properly mocked")
    public void test_delete_publication() throws Exception{
        Response createResponse = resource.createPublication(createTestPublicationJSON("publication_SHOULD_BE_PATCHABLE"));
        String publicationId = createResponse.getHeaderString("Location").replaceAll("http://deichman.no/publication/", "");
        Response response = resource.deletePublication(publicationId);
        assertEquals(NO_CONTENT.getStatusCode(), response.getStatus());
    }

    @Test(expected = BadRequestException.class) @Ignore("Koha not properly mocked")
    public void patch_should_return_status_400() throws Exception {
        Response result = resource.createPublication(createTestPublicationJSON("publication_SHOULD_BE_PATCHABLE"));
        String publicationId = result.getLocation().getPath().substring("/publication/".length());
        String patchData = "{}";
        resource.patchPublication(publicationId, patchData);
    }

    @Test @Ignore("Koha not properly mocked")
    public void patched_publication_should_persist_changes() throws Exception {
        String publication = createTestPublicationJSON("publication_SHOULD_BE_PATCHABLE");
        Response result = resource.createPublication(publication);
        String publicationId = result.getLocation().getPath().substring("/publication/".length());
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
        String response = patchResponse.getEntity().toString();
        InputStream in = new ByteArrayInputStream(response.getBytes(StandardCharsets.UTF_8));
        RDFDataMgr.read(testModel, in, Lang.JSONLD);
        Statement s = ResourceFactory.createStatement(
                ResourceFactory.createResource(result.getLocation().toString()),
                ResourceFactory.createProperty("http://deichman.no/ontology#color"),
                ResourceFactory.createPlainLiteral("red"));
        assertTrue(testModel.contains(s));
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
                // NOOP
            }
            valid = true;
        } catch (IOException ioe) {
            ioe.printStackTrace();
        }

        return valid;
    }
}
