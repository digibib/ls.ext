package no.deichman.services.resources;


import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;
import no.deichman.services.kohaadapter.KohaAdapterMock;
import no.deichman.services.repository.RepositoryInMemory;
import no.deichman.services.uridefaults.BaseURIDefault;
import org.apache.commons.io.IOUtils;
import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFDataMgr;
import org.junit.Before;
import org.junit.Test;

import javax.ws.rs.core.Response;
import java.io.*;
import java.nio.charset.StandardCharsets;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

public class OntologyResourceTest {

    private OntologyResource resource;

    @Before
    public void setUp() throws Exception {
        resource = new OntologyResource();
    }

    @Test
    public void should_get_ontology () throws IOException {
        Response result = resource.getOntologyJSON();
        String entity = result.getEntity().toString();
        Model m = ModelFactory.createDefaultModel();
        Model comparison = ModelFactory.createDefaultModel();
        InputStream in = new ByteArrayInputStream(entity.getBytes(StandardCharsets.UTF_8));
        try (FileInputStream fileInputStream = new FileInputStream(new File("src/main/resources/ontology.ttl"))){
            String fromFile = IOUtils.toString(fileInputStream).replace("http://data.deichman.no/lsext-model#", BaseURIDefault.getOntologyURI());
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
}
