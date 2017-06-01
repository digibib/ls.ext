package no.deichman.services.search;

import no.deichman.services.rdf.RDFModelUtil;
import no.deichman.services.uridefaults.XURI;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.riot.Lang;
import org.junit.Assert;
import org.junit.Test;

import static uk.co.datumedge.hamcrest.json.SameJSONAs.sameJSONAs;

/**
 * Responsibility: unit test PersonModelToIndexMapper.
 */
public class PersonModelToIndexMapperTest {
    @Test
    public void testModelToIndexDocument() throws Exception {
        XURI personXuri = new XURI("http://data.deichman.no/person/h1");

        String inputGraph = ""
                + "@prefix deich: <http://data.deichman.no/ontology#> .\n"
                + "@prefix   xsd: <http://www.w3.org/2001/XMLSchema#> .\n"
                + "@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .\n"
                + "<http://data.deichman.no/person/h1> a deich:Person ;\n"
                + "    deich:name \"Hamsun, Knut\" ;\n"
                + "    deich:specification \"Forfatter\" ;\n"
                + "    deich:ordinal \"VII\" ;\n"
                + "    deich:nationality <http://data.deichman.no/nationality#n> ;\n"
                + "    deich:birthYear \"1859\"^^xsd:gYear ;\n"
                + "    deich:deathYear \"1952\"^^xsd:gYear .\n"
                + "\n"
                + "<http://data.deichman.no/work/w1> a deich:Work ;\n"
                + "    deich:mainTitle \"Sult\" ;\n"
                + "    deich:hasWorkType <http://data.deichman.no/workType#literature> ;\n"
                + "    deich:contributor [\n"
                + "        a deich:Contribution, deich:MainEntry ;\n"
                + "        deich:agent <http://data.deichman.no/person/h1> ;\n"
                + "        deich:role <http://data.deichman.no/role#author>\n"
                + "    ] .\n"
                + "\n"
                + "<http://data.deichman.no/work/w2> a deich:Work ;\n"
                + "    deich:mainTitle \"Pan\" ;\n"
                + "    deich:hasWorkType <http://data.deichman.no/workType#film> ; \n"
                + "    deich:contributor [\n"
                + "        a deich:Contribution, deich:MainEntry ;\n"
                + "        deich:agent <http://data.deichman.no/person/h1> ;\n"
                + "        deich:role <http://data.deichman.no/role#illustrator>\n"
                + "    ] .\n"
                + "\n"
                + "<http://data.deichman.no/nationality#n> rdfs:label \"Norsk\"@no, \"Norwegian\"@en ."
                + "<http://data.deichman.no/role#author> rdfs:label \"Forfatter\"@no, \"Author\"@en ."
                + "<http://data.deichman.no/role#illustrator> rdfs:label \"Illustratør\"@no, \"Illustrator\"@en ."
                + "<http://data.deichman.no/workType#literature> rdfs:label \"Litteratur\"@no, \"Literature\"@en ."
                + "<http://data.deichman.no/workType#film> rdfs:label \"Film\"@no, \"Film\"@en .";

        Model model = RDFModelUtil.modelFrom(inputGraph, Lang.TURTLE);
        String jsonDocument = new ModelToIndexMapper("person").createIndexDocument(model, personXuri);

        Assert.assertThat(jsonDocument, sameJSONAs(""
                + "{"
                + "  \"uri\":\"http://data.deichman.no/person/h1\","
                + "  \"name\":\"Hamsun, Knut\","
                + "  \"specification\":\"Forfatter\","
                + "  \"ordinal\":\"VII\","
                + "  \"birthYear\":\"1859\","
                + "  \"deathYear\":\"1952\","
                + "  \"nationality\":\"Norwegian\","
                + "  \"work\":["
                + "     {"
                + "        \"uri\":\"http://data.deichman.no/work/w1\","
                + "        \"role\": \"Author\",\n"
                + "        \"mainTitle\":\"Sult\",\n"
                + "        \"workType\":\"Literature\""
                + "     },"
                + "     {"
                + "        \"uri\":\"http://data.deichman.no/work/w2\","
                + "        \"role\": \"Illustrator\",\n"
                + "        \"mainTitle\":\"Pan\",\n"
                + "        \"workType\":\"Film\""
                + "     }"
                + "  ]"
                + "}").allowingAnyArrayOrdering());
    }
}
