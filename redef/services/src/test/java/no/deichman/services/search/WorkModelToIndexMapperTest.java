package no.deichman.services.search;

import no.deichman.services.rdf.RDFModelUtil;
import no.deichman.services.uridefaults.XURI;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.riot.Lang;
import org.junit.Assert;
import org.junit.Test;

import static uk.co.datumedge.hamcrest.json.SameJSONAs.sameJSONAs;

/**
 * Responsibility: unit test WorkModelToIndexMapper.
 */
public class WorkModelToIndexMapperTest {
    private String comparisonJsonDocument = "{\n"
            + "        \"uri\": \"%1$s\",\n"
            + "        \"contributors\": [{\n"
            + "            \"agent\": {\n"
            + "                \"uri\": \"%2$s\",\n"
            + "                \"birthYear\": \"1957\",\n"
            + "                \"name\": \"Ragde, Anne B.\"\n"
            + "            },\n"
            + "            \"mainEntry\": true,\n"
            + "            \"role\": \"http://data.deichman.no/role#author\"\n"
            + "        }],\n"
            + "        \"mainEntryName\": \"Ragde, Anne B.\","
            + "        \"mainTitle\": \"Berlinerpoplene\","
            + "        \"subtitle\": \"Hvit uke i Trondheim\","
            + "        \"partTitle\": \"Tredje del\","
            + "        \"partNumber\": \"3\","
            + "        \"summary\": \"In the end, everybody dies\","
            + "        \"publicationYear\": \"1999\","
            + "        \"litform\": \"Roman\","
            + "        \"bio\": \"Biografisk innhold\",\n"
            + "        \"displayLine1\": \"Ragde, Anne B.. Berlinerpoplene : Hvit uke i Trondheim. 3. Tredje del\",\n"
            + "        \"displayLine2\": \"1999. Litteratur. Roman\","
            + "         \"subjects\": [\n"
            + "              {\n"
            + "                   \"uri\": \"http://data.deichman.no/subject/e1200005\"\n"
            + "              }\n"
            + "         ],\n"
            + "        \"genre\": [\n"
            + "            \"Krim (spesial)\"\n"
            + "        ],\n"
            + "        \"compositionType\": \"Opera\",\n"
            + "        \"fictionNonfiction\": \"http://data.deichman.no/fictionNonfiction#fiction\",\n"
            + "        \"workTypeLabel\": \"Litteratur\",\n"
            + "        \"dewey\": \"123.456\",\n"
            + "        \"subject\": \"Trondheim\",\n"
            + "        \"audiences\": [\n"
            + "            \"http://data.deichman.no/audience#adult\"\n"
            + "        ],\n"
            + "        \"hasWorkType\": {\n"
            + "              \"uri\": \"http://data.deichman.no/workType#Literature\"\n"
            + "         }\n"
            + "}";

    @Test
    public void testModelToIndexDocument() throws Exception {
        XURI workXuri = new XURI("http://data.deichman.no/work/w4e5db3a95caa282e5968f68866774e20");
        XURI personXuri = new XURI("http://data.deichman.no/person/h10834700");
        XURI publicationXuri1 = new XURI("http://data.deichman.no/publication/p594502562255");
        XURI publicationXuri2 = new XURI("http://data.deichman.no/publication/p735933031021");
        XURI subjectXuri = new XURI("http://data.deichman.no/subject/e1200005");

        String inputGraph = "@prefix ns1: <http://data.deichman.no/duo#> .\n"
                + "@prefix ns2: <http://data.deichman.no/ontology#> .\n"
                + "@prefix ns4: <http://data.deichman.no/raw#> .\n"
                + "@prefix ns5: <http://data.deichman.no/role#> .\n"
                + "@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .\n"
                + "@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .\n"
                + "@prefix xml: <http://www.w3.org/XML/1998/namespace> .\n"
                + "@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .\n"
                + "\n"
                + "<http://data.deichman.no/work/w4e5db3a95caa282e5968f68866774e20> rdf:type ns2:Work ;\n"
                + "    ns2:audience <http://data.deichman.no/audience#adult> ;\n"
                + "    ns2:contributor [ rdf:type ns2:Contribution, ns2:MainEntry ;\n"
                + "            ns2:agent <http://data.deichman.no/person/h10834700> ;\n"
                + "            ns2:role ns5:author ] ;\n"
                + "    ns2:hasClassification [ rdf:type ns2:ClassificationEntry ; \n"
                + "            ns2:hasClassificationNumber \"123.456\" ] ;\n"
                + "    ns2:language <http://lexvo.org/id/iso639-3/nob> ;\n"
                + "    ns2:literaryForm <http://data.deichman.no/literaryForm#novel> ;\n"
                + "    ns2:genre <http://deichman.no/genre/g1> ;\n"
                + "    ns2:hasCompositionType <http://deichman.no/compositionType/c1> ;\n"
                + "    ns2:mainTitle \"Berlinerpoplene\" ;\n"
                + "    ns2:subtitle \"Hvit uke i Trondheim\" ;\n"
                + "    ns2:partTitle \"Tredje del\" ;\n"
                + "    ns2:partNumber \"3\" ;\n"
                + "    ns2:hasSummary \"In the end, everybody dies\" ;\n"
                + "    ns2:publicationYear \"1999\" \n;"
                + "    ns2:subject <http://data.deichman.no/subject/e1200005> ;\n"
                + "    ns2:biography <http://data.deichman.no/biography#biographicalContent> ;\n"
                + "    ns2:fictionNonfiction <http://data.deichman.no/fictionNonfiction#fiction> ;\n"
                + "    ns2:hasWorkType <http://data.deichman.no/workType#Literature> .\n"
                + "\n"
                + "<http://data.deichman.no/person/h10834700> rdf:type ns2:Person ;\n"
                + "    ns2:birthYear \"1957\" ;\n"
                + "    ns2:name \"Ragde, Anne B.\" ;\n"
                + "    ns2:nationality <http://data.deichman.no/nationality#n> ;\n"
                + "    ns2:personTitle \"forfatter\" ;\n"
                + "    ns4:lifeSpan \"1957-\" ;\n"
                + "    ns1:bibliofilPersonId \"10834700\" .\n"
                + "\n"
                + "<http://data.deichman.no/person/h11234> rdf:type ns2:Person ;\n"
                + "    ns2:name \"Falcinella, Cristina\" ;\n"
                + "    ns2:nationality <http://data.deichman.no/nationality#ita> .\n"
                + "\n"
                + "<http://deichman.no/genre/g1> rdf:type ns2:Genre ;\n"
                + "    ns2:prefLabel \"Krim\" ;\n"
                + "    ns2:specification \"spesial\" ."
                + "\n"
                + "<http://deichman.no/compositionType/c1> rdf:type ns2:CompositionType ;\n"
                + "    ns2:prefLabel \"Opera\" ;\n"
                + "    ns2:specification \"It isn't over until the fat lady sins\" ."
                + "\n"
                + "<http://data.deichman.no/subject/e1200005> rdf:type ns2:Subject ;\n"
                + "    ns2:prefLabel \"Trondheim\" .\n"
                + "<http://data.deichman.no/workType#Literature> rdfs:label \"Litteratur\"@no, \"Literature\"@en .\n"
                + "<http://data.deichman.no/biography#biographicalContent> rdfs:label \"Biografisk innhold\"@no, \"Biographical content\"@en . \n"
                + "<http://data.deichman.no/literaryForm#fiction> rdfs:label \"Skjønnlitteratur\"@no .\n"
                + "<http://data.deichman.no/literaryForm#novel> rdfs:label \"Roman\"@no .\n";

        Model model = RDFModelUtil.modelFrom(inputGraph, Lang.TURTLE);
        String jsonDocument = new ModelToIndexMapper("work").createIndexDocument(model, workXuri);

        Assert.assertThat(jsonDocument, sameJSONAs(String.format(
                comparisonJsonDocument,
                workXuri.getUri(),
                personXuri.getUri(),
                publicationXuri1.getUri(),
                publicationXuri2.getUri(),
                subjectXuri.getUri())
        ).allowingAnyArrayOrdering());
    }
}
