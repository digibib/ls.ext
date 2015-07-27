package no.deichman.services.ontology;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import static no.deichman.services.rdf.RDFModelUtil.modelFrom;
import no.deichman.services.uridefaults.BaseURIMock;
import org.apache.commons.io.IOUtils;
import org.apache.jena.riot.Lang;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import org.junit.Test;

public class FileBasedOntologyServiceTest {

    @Test
    public void should_return_ontology_as_string() throws IOException {
        OntologyService ontology = new FileBasedOntologyService(new BaseURIMock());
        String onto = ontology.getOntologyTurtle();
        try (FileInputStream fileInputStream = new FileInputStream(new File("src/main/resources/ontology.ttl"))){
            String fromFile = IOUtils.toString(fileInputStream);
            assertTrue(onto.equals(fromFile.replace("http://data.deichman.no/lsext-model#", new BaseURIMock().getOntologyURI())));
        }
    }

    @Test
    public void should_return_as_jsonld() {
        OntologyService ontology = new FileBasedOntologyService(new BaseURIMock());
        String result = ontology.getOntologyJsonLD();
        assertNotNull(result);
        assertNotNull(modelFrom(result, Lang.JSONLD));
    }
}
