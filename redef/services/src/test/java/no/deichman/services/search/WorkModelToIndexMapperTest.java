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
            + "        \"mainTitle\": \"Berlinerpoplene\",\n"
            + "        \"subjects\": [{\n"
            + "          \"uri\": \"%5$s\",\n"
            + "          \"name\": \"Trondheim\""
            + "        }],"
            + "        \"publications\": [{\n"
            + "            \"uri\": \"%3$s\",\n"
            + "            \"audiences\": [\"http://data.deichman.no/audience#adult\"],\n"
            + "            \"contributors\": [{\n"
            + "                \"agent\": {\n"
            + "                    \"uri\": \"%2$s\",\n"
            + "                    \"birthYear\": \"1957\",\n"
            + "                    \"name\": \"Ragde, Anne B.\"\n"
            + "                },\n"
            + "                \"role\": \"http://data.deichman.no/role#author\"\n"
            + "            }],\n"
            + "            \"formats\": [\"http://data.deichman.no/format#Book\"],\n"
            + "            \"issued\": \"2013\",\n"
            + "            \"languages\": [\"http://lexvo.org/id/iso639-3/ita\"],\n"
            + "            \"image\": \"http://static.deichman.no/1549895/bk/1_thumb.jpg\",\n"
            + "            \"mainTitle\": \"La casa delle bugie\"\n"
            + "        }, {\n"
            + "            \"uri\": \"%4$s\",\n"
            + "            \"audiences\": [\"http://data.deichman.no/audience#adult\"],\n"
            + "            \"contributors\": [{\n"
            + "                \"agent\": {\n"
            + "                    \"uri\": \"http://data.deichman.no/person/h11234\",\n"
            + "                    \"name\": \"Falcinella, Cristina\"\n"
            + "                },\n"
            + "                \"role\": \"http://data.deichman.no/role#translator\"\n"
            + "            }, {\n"
            + "                \"agent\": {\n"
            + "                    \"uri\": \"%2$s\",\n"
            + "                    \"birthYear\": \"1957\",\n"
            + "                    \"name\": \"Ragde, Anne B.\"\n"
            + "                },\n"
            + "                \"role\": \"http://data.deichman.no/role#author\"\n"
            + "            }],\n"
            + "            \"formats\": [\"http://data.deichman.no/format#Book\"],\n"
            + "            \"branches\": [\"hutl\", \"fgry\"],\n"
            + "            \"issued\": \"2004\",\n"
            + "            \"languages\": [\"http://lexvo.org/id/iso639-3/nob\"],\n"
            + "            \"image\": \"http://static.deichman.no/626460/kr/1_thumb.jpg\",\n"
            + "            \"mainTitle\": \"Berlinerpoplene\"\n"
            + "        }]\n"
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
                + "<http://data.deichman.no/publication/p594502562255> rdf:type ns2:Publication ;\n"
                + "    ns2:bibliofilPublicationID \"1549895\" ;\n"
                + "    ns2:contributor [ rdf:type ns2:Contribution ;\n"
                + "            ns2:agent <http://data.deichman.no/person/h10834700> ;\n"
                + "            ns2:role ns5:author ] ;\n"
                + "    ns2:format <http://data.deichman.no/format#Book> ;\n"
                + "    ns2:isbn \"978-88-545-0662-6\" ;\n"
                + "    ns2:language <http://lexvo.org/id/iso639-3/ita> ;\n"
                + "    ns2:mainTitle \"La casa delle bugie\" ;\n"
                + "    ns2:publicationOf <http://data.deichman.no/work/w4e5db3a95caa282e5968f68866774e20> ;\n"
                + "    ns2:publicationYear \"2013\"^^xsd:gYear ;\n"
                + "    ns2:recordID \"3\" ;\n"
                + "    ns2:hasImage \"http://static.deichman.no/1549895/bk/1_thumb.jpg\" ;\n"
                + "    ns4:locationDewey \"ITA\" ;\n"
                + "    ns4:locationSignature \"Rag\" ;\n"
                + "    ns4:statementOfResponsibility \"Anne B. Ragde ; traduzione di Cristina Falcinella\" .\n"
                + "\n"
                + "<http://data.deichman.no/publication/p735933031021> rdf:type ns2:Publication ;\n"
                + "    ns2:bibliofilPublicationID \"0626460\" ;\n"
                + "    ns2:contributor [ rdf:type ns2:Contribution ;\n"
                + "            ns2:agent <http://data.deichman.no/person/h10834700> ;\n"
                + "            ns2:role ns5:author ] ;\n"
                + "    ns2:contributor [ rdf:type ns2:Contribution ;\n"
                + "            ns2:agent <http://data.deichman.no/person/h11234> ;\n"
                + "            ns2:role ns5:translator ] ;\n"
                + "    ns2:format <http://data.deichman.no/format#Book> ;\n"
                + "    ns2:isbn \"82-495-0272-8\" ;\n"
                + "    ns2:language <http://lexvo.org/id/iso639-3/nob> ;\n"
                + "    ns2:mainTitle \"Berlinerpoplene\" ;\n"
                + "    ns2:publicationOf <http://data.deichman.no/work/w4e5db3a95caa282e5968f68866774e20> ;\n"
                + "    ns2:publicationYear \"2004\"^^xsd:gYear ;\n"
                + "    ns2:recordID \"11\" ;\n"
                + "    ns2:hasImage \"http://static.deichman.no/626460/kr/1_thumb.jpg\" ;\n"
                + "    ns2:hasHoldingBranch \"hutl\", \"fgry\" ;"
                + "    ns2:subtitle \"roman\" ;\n"
                + "    ns4:locationSignature \"Rag\" ;\n"
                + "    ns4:publicationHistory \"Forts. i: Eremittkrepsene\" ;\n"
                + "    ns4:statementOfResponsibility \"Anne Birkefeldt Ragde\" .\n"
                + "\n"
                + "\n"
                + "<http://data.deichman.no/work/w4e5db3a95caa282e5968f68866774e20> rdf:type ns2:Work ;\n"
                + "    ns2:audience <http://data.deichman.no/audience#adult> ;\n"
                + "    ns2:contributor [ rdf:type ns2:Contribution,\n"
                + "                ns2:MainEntry ;\n"
                + "            ns2:agent <http://data.deichman.no/person/h10834700> ;\n"
                + "            ns2:role ns5:author ] ;\n"
                + "    ns2:language <http://lexvo.org/id/iso639-3/nob> ;\n"
                + "    ns2:literaryForm <http://data.deichman.no/literaryForm#fiction>,\n"
                + "        <http://data.deichman.no/literaryForm#novel> ;\n"
                + "    ns2:mainTitle \"Berlinerpoplene\" ;\n"
                + "    ns2:subject <http://data.deichman.no/subject/e1200005> .\n"
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
                + "<http://data.deichman.no/subject/e1200005> rdf:type ns2:Subject ;\n"
                + "    ns2:prefLabel \"Trondheim\"";

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
