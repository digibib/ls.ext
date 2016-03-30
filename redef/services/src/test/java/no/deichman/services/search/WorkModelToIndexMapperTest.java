package no.deichman.services.search;

import no.deichman.services.uridefaults.BaseURI;
import no.deichman.services.uridefaults.XURI;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.rdf.model.ResourceFactory;
import org.apache.jena.vocabulary.RDF;
import org.junit.Assert;
import org.junit.Test;

import static uk.co.datumedge.hamcrest.json.SameJSONAs.sameJSONAs;

/**
 * Responsibility: unit test WorkModelToIndexMapper.
 */
public class WorkModelToIndexMapperTest {
    private String comparisonJsonDocument = ""
            + "{"
            + "   \"work\":{"
            + "      \"uri\":\"%1$s\","
            + "      \"creator\":{"
            + "         \"uri\":\"%2$s\","
            + "         \"name\":\"personName_value\""
            + "      },"
            + "      \"mainTitle\":["
            + "         \"work_1_title\","
            + "         \"work_1_english_title\""
            + "      ],"
            + "      \"partTitle\":["
            + "         \"work_1_part_title\","
            + "         \"work_1_english_part_title\""
            + "      ],"
            + "      \"publication\":["
            + "         {"
            + "            \"uri\":\"%3$s\","
            + "            \"format\":\"http://data.deichman.no/format#Book\","
            + "            \"audience\":\"http://data.deichman.no/audience#juvenile\","
            + "            \"language\":\"http://lexvo.org/id/iso639-3/eng\""
            + "         },"
            + "         {"
            + "            \"uri\":\"%4$s\","
            + "            \"format\":\"http://data.deichman.no/format#DVD\","
            + "            \"audience\":\"http://data.deichman.no/audience#juvenile\","
            + "            \"language\":\"http://lexvo.org/id/iso639-3/nob\""
            + "         },"
            + "         {"
            + "            \"uri\":\"%5$s\","
            + "            \"format\":\"http://data.deichman.no/format#Book\","
            + "            \"audience\":\"http://data.deichman.no/audience#juvenile\","
            + "            \"language\":\"http://lexvo.org/id/iso639-3/nob\""
            + "         }"
            + "      ]"
            + "   }"
            + "}";

    @Test
    public void testModelToIndexDocument() throws Exception {
        XURI workXuri = new XURI("http://deichman.no/work/w00000012123");
        XURI personXuri = new XURI("http://deichman.no/person/p5523125");
        XURI publicationXuri1 = new XURI("http://deichman.no/publication/p1200001");
        XURI publicationXuri2 = new XURI("http://deichman.no/publication/p1200002");
        XURI publicationXuri3 = new XURI("http://deichman.no/publication/p1200003");

        Model model = ModelFactory.createDefaultModel();
        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(personXuri.getUri()),
                RDF.type,
                ResourceFactory.createResource("http://deichman.no/ontology#Person")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(personXuri.getUri()),
                ResourceFactory.createProperty("http://deichman.no/ontology#name"),
                ResourceFactory.createPlainLiteral("personName_value")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(workXuri.getUri()),
                RDF.type,
                ResourceFactory.createResource("http://deichman.no/ontology#Work")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(workXuri.getUri()),
                ResourceFactory.createProperty("http://deichman.no/ontology#creator"),
                ResourceFactory.createResource(personXuri.getUri())));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(workXuri.getUri()),
                ResourceFactory.createProperty("http://deichman.no/ontology#mainTitle"),
                ResourceFactory.createLangLiteral("work_1_title", "no")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(workXuri.getUri()),
                ResourceFactory.createProperty("http://deichman.no/ontology#mainTitle"),
                ResourceFactory.createLangLiteral("work_1_english_title", "en")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(workXuri.getUri()),
                ResourceFactory.createProperty("http://deichman.no/ontology#partTitle"),
                ResourceFactory.createPlainLiteral("work_1_part_title")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(workXuri.getUri()),
                ResourceFactory.createProperty("http://deichman.no/ontology#partTitle"),
                ResourceFactory.createLangLiteral("work_1_english_part_title", "en")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(workXuri.getUri()),
                ResourceFactory.createProperty("http://deichman.no/ontology#audience"),
                ResourceFactory.createResource("http://data.deichman.no/audience#juvenile")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(publicationXuri1.getUri()),
                ResourceFactory.createProperty("http://deichman.no/ontology#publicationOf"),
                ResourceFactory.createResource(workXuri.getUri())));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(publicationXuri1.getUri()),
                ResourceFactory.createProperty("http://deichman.no/ontology#format"),
                ResourceFactory.createResource("http://data.deichman.no/format#Book")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(publicationXuri1.getUri()),
                ResourceFactory.createProperty("http://deichman.no/ontology#language"),
                ResourceFactory.createResource("http://lexvo.org/id/iso639-3/eng")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(publicationXuri2.getUri()),
                ResourceFactory.createProperty("http://deichman.no/ontology#publicationOf"),
                ResourceFactory.createResource(workXuri.getUri())));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(publicationXuri2.getUri()),
                ResourceFactory.createProperty("http://deichman.no/ontology#format"),
                ResourceFactory.createResource("http://data.deichman.no/format#DVD")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(publicationXuri2.getUri()),
                ResourceFactory.createProperty("http://deichman.no/ontology#language"),
                ResourceFactory.createResource("http://lexvo.org/id/iso639-3/nob")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(publicationXuri3.getUri()),
                ResourceFactory.createProperty("http://deichman.no/ontology#publicationOf"),
                ResourceFactory.createResource(workXuri.getUri())));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(publicationXuri3.getUri()),
                ResourceFactory.createProperty("http://deichman.no/ontology#format"),
                ResourceFactory.createResource("http://data.deichman.no/format#Book")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(publicationXuri3.getUri()),
                ResourceFactory.createProperty("http://deichman.no/ontology#language"),
                ResourceFactory.createResource("http://lexvo.org/id/iso639-3/nob")));

        String jsonDocument = new ModelToIndexMapper("work", BaseURI.local()).createIndexDocument(model, workXuri);

        Assert.assertThat(jsonDocument, sameJSONAs(String.format(comparisonJsonDocument, workXuri.getUri(), personXuri.getUri(), publicationXuri1.getUri(), publicationXuri2.getUri(), publicationXuri3.getUri())).allowingAnyArrayOrdering());
    }
}
