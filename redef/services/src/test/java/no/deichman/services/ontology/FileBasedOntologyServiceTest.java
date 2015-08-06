package no.deichman.services.ontology;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import static no.deichman.services.rdf.RDFModelUtil.modelFrom;
import no.deichman.services.uridefaults.BaseURI;
import org.apache.commons.io.IOUtils;
import org.apache.jena.riot.Lang;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import org.junit.Test;

public class FileBasedOntologyServiceTest {

    @Test
    public void should_return_ontology_as_string() throws IOException {
        OntologyService ontology = new FileBasedOntologyService(BaseURI.local());
        String onto = ontology.getOntologyTurtle();
        try (FileInputStream fileInputStream = new FileInputStream(new File("src/main/resources/ontology.ttl"))){
            String fromFile = IOUtils.toString(fileInputStream);
            assertTrue(onto.equals(fromFile.replace("http://data.deichman.no/lsext-model#", BaseURI.local().ontology())));
        }
    }

    @Test
    public void should_return_as_jsonld() {
        OntologyService ontology = new FileBasedOntologyService(BaseURI.local());
        String result = ontology.getOntologyJsonLD();
        assertNotNull(result);
        assertNotNull(modelFrom(result, Lang.JSONLD));
    }
}
