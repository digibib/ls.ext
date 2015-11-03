package no.deichman.services.search;

import org.apache.commons.lang3.tuple.Pair;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.rdf.model.ResourceFactory;
import org.apache.jena.vocabulary.RDF;
import org.junit.Assert;
import org.junit.Test;

import static com.google.common.collect.ImmutableMap.of;
import static no.deichman.services.search.ModelIndexMapper.modelToIndexDocument;
import static uk.co.datumedge.hamcrest.json.SameJSONAs.sameJSONAs;

/**
 * Responsibility: unit test ModelIndexMapper.
 */
public class ModelIndexMapperTest {
    public static final String QUERY = ""
            + "select ?thing ?b_prop \n"
            + "where { \n"
            + "    ?thing a <http://deichman.no/ontology#thing> ; \n"
            + "                 <http://deichman.no/b_prop> ?b_prop . \n"
            + "}\n";

    @Test
    public void testModelToIndexDocument() throws Exception {
        Model model = ModelFactory.createDefaultModel();
        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource("http://deichman.no/subject_one"),
                RDF.type,
                ResourceFactory.createResource("http://deichman.no/ontology#thing")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource("http://deichman.no/subject_one"),
                ResourceFactory.createProperty("http://deichman.no/a_prop"),
                ResourceFactory.createPlainLiteral("a_prop_value")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource("http://deichman.no/subject_one"),
                ResourceFactory.createProperty("http://deichman.no/b_prop"),
                ResourceFactory.createPlainLiteral("b_prop_value")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource("http://deichman.no/subject_two"),
                ResourceFactory.createProperty("http://deichman.no/a_prop"),
                ResourceFactory.createPlainLiteral("a_prop_value_2")));

        Pair<String, String> uriAndDocument = modelToIndexDocument(
                model, QUERY, "thing", of("subject_one", "thing.subject_one.uri", "b_prop", "thing.subject_one.b_prop"))
                .get();

        Assert.assertEquals("http://deichman.no/subject_one", uriAndDocument.getKey());

        Assert.assertThat(""
                + "{"
                + "  \"thing\": {"
                + "     \"subject_one\": {"
                + "          \"b_prop\": \"b_prop_value\""
                + "     }"
                + "  }"
                + "}", sameJSONAs(uriAndDocument.getValue()));
    }
}
