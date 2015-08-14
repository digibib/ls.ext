package no.deichman.services.rdf;

import com.hp.hpl.jena.rdf.model.Model;
import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFFormat;
import org.junit.Before;
import org.junit.Test;

import static com.hp.hpl.jena.rdf.model.ModelFactory.createDefaultModel;
import static com.hp.hpl.jena.rdf.model.ResourceFactory.createPlainLiteral;
import static com.hp.hpl.jena.rdf.model.ResourceFactory.createProperty;
import static com.hp.hpl.jena.rdf.model.ResourceFactory.createResource;
import static com.hp.hpl.jena.rdf.model.ResourceFactory.createStatement;
import static org.hamcrest.CoreMatchers.equalTo;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertThat;

public class RDFModelUtilTest  {

    private static final String SOME_NTRIPLES = "<http://example.com/test> <http://example.com/onto/resource> <http://example.com/r/m2> .";
    public static final String GARBAGE = "fhaljflksajlkfas";
    private Model inputModel;
    private String modelAsNTriples;

    @Before
    public void setUp() throws Exception {
        inputModel = createDefaultModel();
        inputModel.add(createStatement(createResource("s"), createProperty("p:p"), createPlainLiteral("l")));
        modelAsNTriples = "<s> <p:p> \"l\" .\n";
    }

    @Test
    public void should_create_model_from_string() {
        assertNotNull(RDFModelUtil.modelFrom(SOME_NTRIPLES, Lang.NTRIPLES));
    }

    @Test(expected = Exception.class)
    public void should_throw_if_invalid_string() {
        RDFModelUtil.modelFrom(GARBAGE, Lang.NTRIPLES);
    }

    @Test
    public void should_convert_model_to_lang_string() throws Exception {
        assertThat(RDFModelUtil.stringFrom(inputModel, Lang.NTRIPLES), equalTo(modelAsNTriples));
    }

    @Test
    public void should_convert_model_to_format_string() throws Exception {
        assertThat(RDFModelUtil.stringFrom(inputModel, RDFFormat.NTRIPLES), equalTo(modelAsNTriples));
    }
}
