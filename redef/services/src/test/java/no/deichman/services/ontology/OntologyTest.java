package no.deichman.services.ontology;

import no.deichman.services.uridefaults.BaseURIDefault;
import org.apache.commons.io.IOUtils;
import org.junit.Test;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

import static org.junit.Assert.assertTrue;

public class OntologyTest {
    @Test
    public void should_return_ontology_as_string() throws IOException {
        OntologyDefault ontology = new OntologyDefault();
        String onto = ontology.toString();
        try (FileInputStream fileInputStream = new FileInputStream(new File("src/main/resources/ontology.ttl"))){
            String fromFile = IOUtils.toString(fileInputStream);
            assertTrue(onto.equals(fromFile.replace("http://data.deichman.no/lsext-model#",BaseURIDefault.getOntologyURI())));
        }
    }

    @Test
    public void should_return_ontology_as_inputstream() throws IOException {
        OntologyDefault ontology = new OntologyDefault();
        InputStream onto = ontology.toInputStream();
        
        try (FileInputStream fileInputStream = new FileInputStream(new File("src/main/resources/ontology.ttl"))){
            String fromFile = IOUtils.toString(fileInputStream).replace("http://data.deichman.no/lsext-model#",BaseURIDefault.getOntologyURI());
			InputStream fileIn = new ByteArrayInputStream(fromFile.getBytes(StandardCharsets.UTF_8));

            assertTrue(IOUtils.contentEquals(onto, fileIn));
        }
    }
}
