package no.deichman.services.rdf;

import org.apache.jena.riot.Lang;
import static org.junit.Assert.assertNotNull;
import org.junit.Test;

public class RDFModelUtilTest  {

    private static final String SOME_NTRIPLES = "<http://example.com/test> <http://example.com/onto/resource> <http://example.com/r/m2> .";
    public static final String GARBAGE = "fhaljflksajlkfas";

    @Test
    public void should_create_model_from_string() {
        assertNotNull(RDFModelUtil.modelFrom(SOME_NTRIPLES, Lang.NTRIPLES));
    }

    @Test(expected = Exception.class)
    public void should_throw_if_invalid_string() {
        RDFModelUtil.modelFrom(GARBAGE, Lang.NTRIPLES);
    }
}
