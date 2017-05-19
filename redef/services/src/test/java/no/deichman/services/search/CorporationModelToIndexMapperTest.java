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
 * Responsibility: unit test CorporationModelToIndexMapper.
 */
public class CorporationModelToIndexMapperTest extends ModelToIndexMapperTestSupport {

    public CorporationModelToIndexMapperTest() throws Exception {
    }

    @Test
    public void testModelToIndexDocument_withAlternativePlaceName() throws Exception {
        doTest(true);
    }

    @Test
    public void testModelToIndexDocument_withoutAlternativePlaceName() throws Exception {
        doTest(false);
    }

    private void doTest(boolean withAlternativePlaceName) throws Exception {
        XURI corporationUri = new XURI(BaseURI.root(), EntityType.CORPORATION.getPath(), "h00000121");
        Model model = ModelFactory.createDefaultModel();
        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(corporationUri.getUri()),
                RDF.type,
                ResourceFactory.createResource(BaseURI.ontology("Corporation"))));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(corporationUri.getUri()),
                ResourceFactory.createProperty(BaseURI.root() + "a_prop"),
                ResourceFactory.createPlainLiteral("a_prop_value")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(corporationUri.getUri()),
                ResourceFactory.createProperty(BaseURI.ontology("name")),
                ResourceFactory.createPlainLiteral("publisherName_value")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(corporationUri.getUri()),
                ResourceFactory.createProperty(BaseURI.ontology("alternativeName")),
                ResourceFactory.createPlainLiteral("alternativeName_value")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(corporationUri.getUri()),
                ResourceFactory.createProperty(BaseURI.ontology("subdivision")),
                ResourceFactory.createPlainLiteral("subdivision_value")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(corporationUri.getUri()),
                ResourceFactory.createProperty(BaseURI.ontology("specification")),
                ResourceFactory.createPlainLiteral("specification_value")));

        addPlaceToModel(withAlternativePlaceName, corporationUri, model);

        String jsonDocument = new ModelToIndexMapper("corporation").createIndexDocument(model, corporationUri);

        Assert.assertThat(jsonDocument, sameJSONAs(""
                + "{"
                + "  \"uri\": \"" + corporationUri.getUri() + "\","
                + "  \"name\": \"publisherName_value\","
                + "  \"alternativeName\": \"alternativeName_value\","
                + "  \"subdivision\": \"subdivision_value\","
                + "  \"specification\": \"specification_value\","
                + "  \"displayLine1\": \"publisherName_value. subdivision_value (specification_value). " + getPlacePrefLabel() + "\","
                + "  \"placePrefLabel\": \"" + getPlacePrefLabel() + "\","
                + (withAlternativePlaceName ? "  \"placeAlternativeName\": \"" + getPlaceAlternativeName() + "\"" : "")
                + "}").allowingAnyArrayOrdering());
    }

}
