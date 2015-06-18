package no.deichman.services.ontology;

import no.deichman.services.uridefaults.BaseURIMock;
import org.apache.commons.io.IOUtils;
import org.junit.Test;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;

import static org.junit.Assert.assertTrue;

public class OntologyServiceTest {

    @Test
    public void should_return_ontology_as_string() throws IOException {
        OntologyService ontology = new OntologyService(new BaseURIMock());
        String onto = ontology.getOntologyTurtle();
        try (FileInputStream fileInputStream = new FileInputStream(new File("src/main/resources/ontology.ttl"))){
            String fromFile = IOUtils.toString(fileInputStream);
            assertTrue(onto.equals(fromFile.replace("http://data.deichman.no/lsext-model#", new BaseURIMock().getOntologyURI())));
        }
    }
}
