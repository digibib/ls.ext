package no.deichman.services.search;

import no.deichman.services.uridefaults.BaseURI;
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
            + "      \"uri\":\"http://deichman.no/work_1\","
            + "      \"creator\":{"
            + "         \"uri\":\"http://deichman.no/person_1\","
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
            + "            \"uri\":\"http://deichman.no/publication_1\","
            + "            \"format\":\"Bok\","
            + "            \"audience\":\"Barn og ungdom\","
            + "            \"language\":\"Engelsk\""
            + "         },"
            + "         {"
            + "            \"uri\":\"http://deichman.no/publication_2\","
            + "            \"format\":\"DVD\","
            + "            \"audience\":\"Barn og ungdom\","
            + "            \"language\":\"Norsk (bokmål)\""
            + "         },"
            + "         {"
            + "            \"uri\":\"http://deichman.no/publication_3\","
            + "            \"audience\":\"Barn og ungdom\","
            + "            \"language\":\"Norsk (bokmål)\""
            + "         }"
            + "      ]"
            + "   }"
            + "}";

    @Test
    public void testModelToIndexDocument() throws Exception {
        Model model = ModelFactory.createDefaultModel();
        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource("http://deichman.no/person_1"),
                RDF.type,
                ResourceFactory.createResource("http://deichman.no/ontology#Person")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource("http://deichman.no/person_1"),
                ResourceFactory.createProperty("http://deichman.no/ontology#name"),
                ResourceFactory.createPlainLiteral("personName_value")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource("http://deichman.no/work_1"),
                RDF.type,
                ResourceFactory.createResource("http://deichman.no/ontology#Work")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource("http://deichman.no/work_1"),
                ResourceFactory.createProperty("http://deichman.no/ontology#creator"),
                ResourceFactory.createResource("http://deichman.no/person_1")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource("http://deichman.no/work_1"),
                ResourceFactory.createProperty("http://deichman.no/ontology#mainTitle"),
                ResourceFactory.createLangLiteral("work_1_title", "no")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource("http://deichman.no/work_1"),
                ResourceFactory.createProperty("http://deichman.no/ontology#mainTitle"),
                ResourceFactory.createLangLiteral("work_1_english_title", "en")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource("http://deichman.no/work_1"),
                ResourceFactory.createProperty("http://deichman.no/ontology#partTitle"),
                ResourceFactory.createPlainLiteral("work_1_part_title")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource("http://deichman.no/work_1"),
                ResourceFactory.createProperty("http://deichman.no/ontology#partTitle"),
                ResourceFactory.createLangLiteral("work_1_english_part_title", "en")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource("http://deichman.no/work_1"),
                ResourceFactory.createProperty("http://deichman.no/ontology#audience"),
                ResourceFactory.createResource("http://data.deichman.no/audience#juvenile")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource("http://deichman.no/publication_1"),
                ResourceFactory.createProperty("http://deichman.no/ontology#publicationOf"),
                ResourceFactory.createResource("http://deichman.no/work_1")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource("http://deichman.no/publication_1"),
                ResourceFactory.createProperty("http://deichman.no/ontology#format"),
                ResourceFactory.createResource("http://data.deichman.no/format#Book")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource("http://deichman.no/publication_1"),
                ResourceFactory.createProperty("http://deichman.no/ontology#language"),
                ResourceFactory.createResource("http://lexvo.org/id/iso639-3/eng")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource("http://deichman.no/publication_2"),
                ResourceFactory.createProperty("http://deichman.no/ontology#publicationOf"),
                ResourceFactory.createResource("http://deichman.no/work_1")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource("http://deichman.no/publication_2"),
                ResourceFactory.createProperty("http://deichman.no/ontology#format"),
                ResourceFactory.createResource("http://data.deichman.no/format#DVD")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource("http://deichman.no/publication_2"),
                ResourceFactory.createProperty("http://deichman.no/ontology#language"),
                ResourceFactory.createResource("http://lexvo.org/id/iso639-3/nob")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource("http://deichman.no/publication_3"),
                ResourceFactory.createProperty("http://deichman.no/ontology#publicationOf"),
                ResourceFactory.createResource("http://deichman.no/work_1")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource("http://deichman.no/publication_3"),
                ResourceFactory.createProperty("http://deichman.no/ontology#format"),
                ResourceFactory.createResource("http://data.deichman.no/format#Bok")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource("http://deichman.no/publication_3"),
                ResourceFactory.createProperty("http://deichman.no/ontology#language"),
                ResourceFactory.createResource("http://lexvo.org/id/iso639-3/nob")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource("http://data.deichman.no/format#DVD"),
                ResourceFactory.createProperty("http://www.w3.org/2000/01/rdf-schema#label"),
                ResourceFactory.createPlainLiteral("DVD")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource("http://data.deichman.no/format#Book"),
                ResourceFactory.createProperty("http://www.w3.org/2000/01/rdf-schema#label"),
                ResourceFactory.createPlainLiteral("Bok")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource("http://lexvo.org/id/iso639-3/nob"),
                ResourceFactory.createProperty("http://www.w3.org/2000/01/rdf-schema#label"),
                ResourceFactory.createPlainLiteral("Norsk (bokmål)")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource("http://lexvo.org/id/iso639-3/eng"),
                ResourceFactory.createProperty("http://www.w3.org/2000/01/rdf-schema#label"),
                ResourceFactory.createPlainLiteral("Engelsk")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource("http://data.deichman.no/audience#juvenile"),
                ResourceFactory.createProperty("http://www.w3.org/2000/01/rdf-schema#label"),
                ResourceFactory.createLangLiteral("Barn og ungdom", "no")));

        String jsonDocument = new ModelToIndexMapper("work", BaseURI.local()).createIndexDocument(model, "http://deichman.no/work_1");

        Assert.assertThat(jsonDocument, sameJSONAs(comparisonJsonDocument).allowingAnyArrayOrdering());
    }
}
