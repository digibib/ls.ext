package no.deichman.services.rdf;

import com.hp.hpl.jena.rdf.model.Model;
import static com.hp.hpl.jena.rdf.model.ModelFactory.createDefaultModel;
import static com.hp.hpl.jena.rdf.model.ResourceFactory.createPlainLiteral;
import static com.hp.hpl.jena.rdf.model.ResourceFactory.createProperty;
import static com.hp.hpl.jena.rdf.model.ResourceFactory.createResource;
import static com.hp.hpl.jena.rdf.model.ResourceFactory.createStatement;
import org.apache.jena.riot.Lang;
import static org.hamcrest.CoreMatchers.equalTo;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertThat;
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

    @Test
    public void should_convert_model_to_string() throws Exception {
        final Model model = createDefaultModel();
        model.add(createStatement(createResource("s"), createProperty("p:p"), createPlainLiteral("l")));
        assertThat(RDFModelUtil.stringFrom(model, Lang.NTRIPLES), equalTo("<s> <p:p> \"l\" .\n"));
    }
}
