package no.deichman.services.rdf;

import no.deichman.services.uridefaults.BaseURI;
import org.apache.commons.io.IOUtils;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFDataMgr;
import org.apache.jena.vocabulary.RDFS;
import org.junit.Test;

import java.util.HashMap;
import java.util.Map;

import static no.deichman.services.rdf.RDFModelUtil.modelFrom;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

public class JSONLDCreatorTest {

    @Test
    public void simple_representation_should_be_isomorphic_after_conversion() {
        JSONLDCreator jsonldCreator = new JSONLDCreator();

        String inputAsN3 = "<http://example.com/test> <http://example.com/onto/resource> <http://example.com/r/m2> .";
        Model modelBeforeJsonLDConversion = modelFrom(inputAsN3, Lang.NTRIPLES);

        String jsonLD = jsonldCreator.asJSONLD(modelBeforeJsonLDConversion);
        Model modelAfterJsonLDConversion = modelFrom(jsonLD, Lang.JSONLD);

        assertTrue(modelBeforeJsonLDConversion.isIsomorphicWith(modelAfterJsonLDConversion));
    }

    @Test
    public void JSONLD_contains_our_special_contexts() {
        JSONLDCreator jsonldCreator = new JSONLDCreator();

        String inputAsN3 = "<http://example.com/test> <http://example.com/onto/resource> <http://example.com/r/m2> .";

        String jsonld = jsonldCreator.asJSONLD(modelFrom(inputAsN3, Lang.NTRIPLES));
        Model model = modelFrom(jsonld, Lang.JSONLD);

        Map<String, String> ns = model.getNsPrefixMap();
        assertTrue(ns.get("deichman").equals(BaseURI.ontology()));
        assertTrue(ns.get("rdfs").equals(RDFS.getURI()));
    }

    @Test
    public void expect_JSONLD_compacted_with_context() {
        JSONLDCreator jsonldCreator = new JSONLDCreator();
        Model model = ModelFactory.createDefaultModel();

        String work = "@prefix deichman: <http://deichman.no/ontology#> .\n"
                + "@prefix xsd: <http://www.w3.org/2001/XMLSchema#> ."
                + "@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> ."
                + "<http://deichman.no/work/w0000000001> a deichman:Work ;\n"
                + "  deichman:name \"work_name\"^^rdf:langString ;\n"
                + "  deichman:creator \"work_creator\" ;\n"
                + "  deichman:year \"1927\"^^xsd:gYear .";


        Map<String, String> name = new HashMap<String, String>();
        name.put("@type", "langString");
        name.put("@id", "deichman:name");

        Map<String, String> year = new HashMap<String, String>();
        year.put("@type", "gYear");
        year.put("@id", "deichman:year");


        Map<String, Object> context = new HashMap<String, Object>();

        context.put("deichman", "http://deichman.no/ontology#");
        context.put("gYear", "http://www.w3.org/2001/XMLSchema#gYear");
        context.put("langString", "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString");
        context.put("Work", "deichman:Work");
        context.put("creator", "deichman:creator");
        context.put("year", year);
        context.put("name", name);
        context.put("deichman", "http://deichman.no/ontology#");

        String expected = "{\n"
                + "  \"@id\" : \"http://deichman.no/work/w0000000001\",\n"
                + "  \"@type\" : \"Work\",\n"
                + "  \"creator\" : \"work_creator\",\n"
                + "  \"name\" : \"work_name\",\n"
                + "  \"year\" : \"1927\",\n"
                + "  \"@context\" : {\n"
                + "    \"gYear\" : \"http://www.w3.org/2001/XMLSchema#gYear\",\n"
                + "    \"creator\" : \"deichman:creator\",\n"
                + "    \"year\" : {\n"
                + "      \"@type\" : \"gYear\",\n"
                + "      \"@id\" : \"deichman:year\"\n"
                + "    },\n"
                + "    \"deichman\" : \"http://deichman.no/ontology#\",\n"
                + "    \"langString\" : \"http://www.w3.org/1999/02/22-rdf-syntax-ns#langString\",\n"
                + "    \"Work\" : \"deichman:Work\",\n"
                + "    \"name\" : {\n"
                + "      \"@type\" : \"langString\",\n"
                + "      \"@id\" : \"deichman:name\"\n"
                + "    }\n"
                + "  }\n"
                + "}";

        RDFDataMgr.read(model, IOUtils.toInputStream(work), Lang.TURTLE);

        String result = jsonldCreator.asJSONLD(model, context);
        assertEquals("JSON-LD did not have appropriate custom context applied", expected, result);
    }

}
