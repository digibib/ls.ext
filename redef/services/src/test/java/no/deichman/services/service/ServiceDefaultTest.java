package no.deichman.services.service;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;

import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFDataMgr;
import org.junit.Before;
import org.junit.Test;

import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;
import com.hp.hpl.jena.rdf.model.ResourceFactory;

import no.deichman.services.error.PatchException;
import no.deichman.services.error.PatchParserException;
import no.deichman.services.repository.RepositoryInMemory;

public class ServiceDefaultTest {
    
    private Service service;
    @Before
    public void setup(){
        service = new ServiceDefault();
        service.setRepository(new RepositoryInMemory());
    }

    @Test
    public void test_patch_work_add() throws UnsupportedEncodingException, PatchException, PatchParserException{
        assertNotNull(service);

        Model oldModel = ModelFactory.createDefaultModel();
        String workData = "{\"@context\": {\"dcterms\": \"http://purl.org/dc/terms/\",\"deichman\": \"http://deichman.no/ontology#\"},\"@graph\": {\"@id\": \"http://deichman.no/work/work_SHOULD_BE_PATCHABLE\",\"@type\": \"deichman:Work\",\"dcterms:identifier\":\"work_SERVICE_DEFAULT_PATCH\"}}";
        String workId = service.createWork(workData);
        String comparisonRDF = workData.replace("http://deichman.no/work/work_SHOULD_BE_PATCHABLE", workId);
        InputStream oldIn = new ByteArrayInputStream(comparisonRDF.getBytes(StandardCharsets.UTF_8));
        RDFDataMgr.read(oldModel, oldIn, Lang.JSONLD);
        Model data = service.retrieveWorkById(workId.replace("http://deichman.no/work/", ""));
        assertTrue(oldModel.isIsomorphicWith(data));
        String patchData = "{"
                + "\"op\": \"add\","
                + "\"s\": \"" + workId + "\","
                + "\"p\": \"http://deichman.no/ontology#color\","
                + "\"o\": {"
                + "\"value\": \"red\""
                + "}"
                + "}";
        Model patchedModel = service.patchWork(workId.replace("http://deichman.no/work/", ""),patchData);
        assertTrue(patchedModel.contains(ResourceFactory.createResource(workId), ResourceFactory.createProperty("http://deichman.no/ontology#color"), "red"));
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        RDFDataMgr.write(baos,patchedModel.difference(oldModel),Lang.NT);
        assertEquals(baos.toString().trim(),
                "<"+ workId + "> <http://deichman.no/ontology#color> \"red\" .");
    }

}
