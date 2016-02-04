package no.deichman.services.search;

import org.apache.commons.lang3.tuple.Pair;
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
    @Test
    public void testModelToIndexDocument() throws Exception {
        Model model = ModelFactory.createDefaultModel();
        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource("http://deichman2.no/person_1"),
                RDF.type,
                ResourceFactory.createResource("http://deichman2.no/ontology#Person")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource("http://deichman2.no/person_1"),
                ResourceFactory.createProperty("http://deichman2.no/ontology#name"),
                ResourceFactory.createPlainLiteral("personName_value")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource("http://deichman2.no/work_1"),
                RDF.type,
                ResourceFactory.createResource("http://deichman2.no/ontology#Work")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource("http://deichman2.no/work_1"),
                ResourceFactory.createProperty("http://deichman2.no/ontology#creator"),
                ResourceFactory.createResource("http://deichman2.no/person_1")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource("http://deichman2.no/work_1"),
                ResourceFactory.createProperty("http://deichman2.no/ontology#mainTitle"),
                ResourceFactory.createLangLiteral("work_1_title", "no")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource("http://deichman2.no/work_1"),
                ResourceFactory.createProperty("http://deichman2.no/ontology#mainTitle"),
                ResourceFactory.createLangLiteral("work_1_english_title", "en")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource("http://deichman2.no/work_1"),
                ResourceFactory.createProperty("http://deichman2.no/ontology#partTitle"),
                ResourceFactory.createPlainLiteral("work_1_part_title")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource("http://deichman2.no/work_1"),
                ResourceFactory.createProperty("http://deichman2.no/ontology#partTitle"),
                ResourceFactory.createLangLiteral("work_1_english_part_title", "en")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource("http://deichman2.no/publication_1"),
                ResourceFactory.createProperty("http://deichman2.no/ontology#publicationOf"),
                ResourceFactory.createResource("http://deichman2.no/work_1")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource("http://deichman2.no/publication_1"),
                ResourceFactory.createProperty("http://deichman2.no/ontology#format"),
                ResourceFactory.createResource("http://data.deichman.no/format#Book")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource("http://deichman2.no/publication_2"),
                ResourceFactory.createProperty("http://deichman2.no/ontology#publicationOf"),
                ResourceFactory.createResource("http://deichman2.no/work_1")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource("http://deichman2.no/publication_2"),
                ResourceFactory.createProperty("http://deichman2.no/ontology#format"),
                ResourceFactory.createResource("http://data.deichman.no/format#DVD")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource("http://data.deichman.no/format#DVD"),
                ResourceFactory.createProperty("http://deichman2.no/ontology#label"),
                ResourceFactory.createPlainLiteral("DVD")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource("http://data.deichman.no/format#Book"),
                ResourceFactory.createProperty("http://deichman2.no/ontology#label"),
                ResourceFactory.createPlainLiteral("Bok")));


        Pair<String, String> uriAndDocument = WorkModelToIndexMapper.getModelToIndexMapperBuilder()
                .withOntologyPrefix("http://deichman2.no/ontology#")
                .build()
                .modelToIndexDocument(model)
                .get();

        Assert.assertEquals("http://deichman2.no/work_1", uriAndDocument.getKey());

        String jsonDocument = uriAndDocument.getValue();
        Assert.assertThat(jsonDocument, sameJSONAs(""
                + "{"
                + "  \"work\": {\n"
                + "      \"uri\": \"http://deichman2.no/work_1\",\n"
                + "      \"mainTitle\": {\n"
                + "             \"no\": \"work_1_title\", \n"
                + "             \"en\": \"work_1_english_title\" \n"
                + "       },\n"
                + "      \"partTitle\": {\n"
                + "             \"default\": \"work_1_part_title\", \n"
                + "             \"en\": \"work_1_english_part_title\" \n"
                + "       },\n"
                + "       \"creator\": {\n"
                + "            \"name\": \"personName_value\",\n"
                + "            \"uri\": \"http://deichman2.no/person_1\"\n"
                + "       },\n"
                + "       \"formats\": [\n"
                + "            \"Bok\", \"DVD\""
                + "      ]\n"
                + "  }\n"
                + "}").allowingAnyArrayOrdering());
    }
}
