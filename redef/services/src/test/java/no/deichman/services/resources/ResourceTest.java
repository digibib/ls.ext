package no.deichman.services.resources;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URISyntaxException;
import java.nio.charset.StandardCharsets;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Pattern;
import javax.ws.rs.NotFoundException;
import javax.ws.rs.core.Response;
import no.deichman.services.kohaadapter.KohaAdapterMock;
import no.deichman.services.repository.RepositoryInMemory;
import no.deichman.services.uridefaults.BaseURIDefault;
import no.deichman.services.uridefaults.BaseURIMock;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFDataMgr;
import org.codehaus.jackson.JsonNode;
import org.codehaus.jackson.JsonParser;
import org.codehaus.jackson.map.ObjectMapper;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;
import org.junit.Before;
import org.junit.Test;

import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;

public class ResourceTest{

    private static final Logger LOG = Logger.getLogger(ResourceTest.class.getName());

    private Resources resource;

    @Before
    public void setUp() throws Exception {
        resource = new Resources(new KohaAdapterMock(), new RepositoryInMemory());
    }

    @Test
    public void should_return_non_empty_json_list_of_Work() {
        Response result = resource.listWork();

        assertNotNull(result);
        assertEquals(200, result.getStatus());
        assertTrue(isValidJSON(result.getEntity().toString()));
        assertNotNull(parseJSON(result.getEntity().toString()).findValue("@id"));
    }

    @Test
    public void should_return_a_valid_json_work() {
        String workId = "work_00001";
        Response result = resource.getWorkJSON(workId);

        assertNotNull(result);
        assertEquals(200, result.getStatus());
        assertTrue(isValidJSON(result.getEntity().toString()));
    }

    @Test(expected = NotFoundException.class)
    public void should_throw_exception_when_work_is_not_found() {
        String workId = "work_DOES_NOT_EXIST";
        resource.getWorkJSON(workId);
    }

    @Test
    public void should_return_201_when_work_created() throws URISyntaxException {
        String work = "{\"@context\": {\"dcterms\": \"http://purl.org/dc/terms/\",\"deichman\": \"http://deichman.no/ontology#\"},\"@graph\": {\"@id\": \"http://deichman.no/work/work_SHOULD_EXIST\",\"@type\": \"deichman:Work\",\"dcterms:identifier\":\"work_SHOULD_EXIST\"}}";

        Response result = resource.createWork(work);

        assertNull(result.getEntity());
        assertEquals(201, result.getStatus());
    }

    @Test
    public void should_return_location_header_when_work_created() throws URISyntaxException {
        String work = "{\"@context\": {\"dcterms\": \"http://purl.org/dc/terms/\",\"deichman\": \"http://deichman.no/ontology#\"},\"@graph\": {\"@id\": \"http://deichman.no/work/work_SHOULD_EXIST\",\"@type\": \"deichman:Work\",\"dcterms:identifier\":\"work_SHOULD_EXIST\"}}";

        Response result = resource.createWork(work);

        String workURI = BaseURIMock.getWorkURI();

        assertNull(result.getEntity());
        assertTrue(Pattern.matches(workURI + "w\\d{12}", result.getHeaderString("Location")));
    }

    @Test
    public void should_return_200_when_work_updated() {
        String work = "{\"@context\": {\"dcterms\": \"http://purl.org/dc/terms/\",\"deichman\": \"http://deichman.no/ontology#\"},\"@graph\": {\"@id\": \"http://deichman.no/work/work_SHOULD_EXIST\",\"@type\": \"deichman:Work\",\"dcterms:identifier\":\"work_SHOULD_EXIST\"}}";
        Response result = resource.updateWork(work);

        assertNull(result.getEntity());
        assertEquals(200, result.getStatus());
    }

    
    @Test
    public void should_return_the_new_work() throws URISyntaxException{
        String work = "{\"@context\": {\"dcterms\": \"http://purl.org/dc/terms/\",\"deichman\": \"http://deichman.no/ontology#\"},\"@graph\": {\"@id\": \"http://deichman.no/work/work_SHOULD_EXIST\",\"@type\": \"deichman:Work\",\"dcterms:identifier\":\"work_SHOULD_EXIST\"}}";

        Response createResponse = resource.createWork(work);

        String workId = createResponse.getHeaderString("Location").replaceAll("http://deichman.no/work/", "");

        Response result = resource.getWorkJSON(workId);
        System.out.println(result.getEntity());

        assertNotNull(result);
        assertEquals(201, createResponse.getStatus());
        assertEquals(200, result.getStatus());
        assertTrue(isValidJSON(result.getEntity().toString()));
    }
    
    @Test
    public void should_return_list_of_items(){
        String work = "{\"@context\": {\"dcterms\": \"http://purl.org/dc/terms/\",\"deichman\": \"http://deichman.no/ontology#\"},\"@graph\": {\"@id\": \"http://deichman.no/work/work_SHOULD_EXIST\",\"@type\": \"deichman:Work\",\"dcterms:identifier\":\"work_SHOULD_EXIST\",\"deichman:biblioId\":\"1\"}}";
        String workId = "work_SHOULD_EXIST";

        Response createResponse = resource.updateWork(work);
        Response result = resource.getWorkItems(workId);

        assertEquals(200, createResponse.getStatus());
        assertNotNull(result);
        assertEquals(200, result.getStatus());
        assertTrue(isValidJSON(result.getEntity().toString()));
    }
    /*
    @Test
    public void should_patch_data() {
    	String wrongWork = "<http://deichman.no/work/work_put_test> a deichman:Work ;\n"
    		        + "  deichman:title \"Peer Gint\" ;"
    	            + "  deichman:creator \"Henryk Ibsen\""
    		        + "  deichman:date \"1876\"";
    	String rightWork = "@prefix deichman: <http://deichman.no/ontology#> \n"
	            + "<http://deichman.no/work/work_put_test> a deichman:Work ;\n"
		        + "  deichman:title \"Peer Gint\" ;"
	            + "  deichman:creator \"Henryk Ibsen\""
		        + "  deichman:date \"1876\"";
    	
    	Response putResponse = resource.putWork(work);
    	assertEquals(200, putResponse.getStatus());
    	assertNotNull(putResponse.getEntity().toString());
    }
    */
    
    @Test
    public void should_parse_patch() {
    	String patchData = "{\"op\":\"add\",\"s\":\"http://deichman.no/work/work_WORK_TO_BE_PATCHED\",\"p\":\"http://deichman.no/ontology#title\",\"o\":{\"value\":\"Title\", \"lang\":\"en\"}}";
        String expected = "INSERT DATA {<http://deichman.no/work/work_WORK_TO_BE_PATCHED><http://deichman.no/ontology#title> \"Title\"@en}";
 //   	ParserResult pr = Parser.parse(patchData);
 //   	assertTrue(pr.getLogicalOutput == expected);	
    }
    
    @Test
    public void should_patch_work() {
    	
    }
    
	@Test
	public void should_get_ontology () throws IOException {
		 Response result = resource.getOntologyJSON();
		 String entity = result.getEntity().toString();
		 Model m = ModelFactory.createDefaultModel();
		 Model comparison = ModelFactory.createDefaultModel();
		 InputStream in = new ByteArrayInputStream(entity.getBytes(StandardCharsets.UTF_8));
         try (FileInputStream fileInputStream = new FileInputStream(new File("src/main/resources/ontology.ttl"))){
		     String fromFile = IOUtils.toString(fileInputStream).replace("http://data.deichman.no/lsext-model#",BaseURIDefault.getOntologyURI());
			 InputStream fileIn = new ByteArrayInputStream(fromFile.getBytes(StandardCharsets.UTF_8));
             RDFDataMgr.read(m, in, Lang.JSONLD);
		     RDFDataMgr.read(comparison, fileIn, Lang.TURTLE);
		     assertEquals(200, result.getStatus());
		     assertTrue(m.isIsomorphicWith(comparison));
         }
	}
	
	@Test
	public void should_get_ontology_as_turtle () throws IOException {
		Response result = resource.getOntologyTurtle();
		String entity = result.getEntity().toString();
		try (FileInputStream fileInputStream = new FileInputStream(new File("src/main/resources/ontology.ttl"))){
		    String fromFile = IOUtils.toString(fileInputStream);
		    System.out.println(entity);
		    assertTrue(entity.equals(fromFile.replace("http://data.deichman.no/lsext-model#",BaseURIDefault.getOntologyURI())));
		}		

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
    

    private JsonNode parseJSON(final String json) {
        try {
            return new ObjectMapper().readTree(json);
        } catch (IOException ex) {
            LOG.log(Level.SEVERE, null, ex);
        }
        return null;
    }
}
