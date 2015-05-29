package no.deichman.services;

import static org.junit.Assert.assertTrue;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

import org.apache.commons.io.IOUtils;
import org.junit.Test;

import no.deichman.services.uridefaults.BaseURIDefault;

public class OntologyTest {
    @Test
    public void should_return_ontology_as_string() throws IOException {
        Ontology ontology = new Ontology();
        String onto = ontology.toString();
        try (FileInputStream fileInputStream = new FileInputStream(new File("src/main/resources/ontology.ttl"))){
            String fromFile = IOUtils.toString(fileInputStream);
            assertTrue(onto.equals(fromFile.replace("http://data.deichman.no/lsext-model#",BaseURIDefault.getOntologyURI())));
        }
    }

    @Test
    public void should_return_ontology_as_inputstream() throws IOException {
        Ontology ontology = new Ontology();
        InputStream onto = ontology.toInputStream();
        String convertedOnto = IOUtils.toString(onto);
        
        try (FileInputStream fileInputStream = new FileInputStream(new File("src/main/resources/ontology.ttl"))){
            String fromFile = IOUtils.toString(fileInputStream);
            String testString = fromFile.replace("http://data.deichman.no/lsext-model#",BaseURIDefault.getOntologyURI());
            assertTrue(convertedOnto.equals(testString));
        }
    }
}
