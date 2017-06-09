package no.deichman.services.search;

import no.deichman.services.entity.EntityType;
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
 * Responsibility: unit test PlaceModelToIndexMapper.
 */
public class GenreModelToIndexMapperTest {

    @Test
    public void testModelToIndexDocument() throws Exception {
        XURI subjetXuri1 = new XURI(BaseURI.root(), EntityType.GENRE.getPath(), "g000000001");
        Model model = ModelFactory.createDefaultModel();
        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(subjetXuri1.getUri()),
                RDF.type,
                ResourceFactory.createResource(BaseURI.ontology("Genre"))));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(subjetXuri1.getUri()),
                ResourceFactory.createProperty(BaseURI.ontology() + "specification"),
                ResourceFactory.createPlainLiteral("Drap og mord")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(subjetXuri1.getUri()),
                ResourceFactory.createProperty(BaseURI.ontology("prefLabel")),
                ResourceFactory.createPlainLiteral("Krim")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(subjetXuri1.getUri()),
                ResourceFactory.createProperty(BaseURI.ontology("alternativeName")),
                ResourceFactory.createPlainLiteral("alternativeName_value")));

        String jsonDocument = new ModelToIndexMapper("genre").createIndexDocument(model, subjetXuri1);

        Assert.assertThat(jsonDocument, sameJSONAs(""
                + "{"
                + "  \"uri\": \"" + subjetXuri1.getUri() + "\","
                + "  \"prefLabel\": \"Krim\","
                + "  \"alternativeName\": \"alternativeName_value\","
                + "  \"displayLine1\": \"Krim (Drap og mord)\","
                + "  \"specification\": \"Drap og mord\","
                + "}").allowingAnyArrayOrdering());
    }
}
