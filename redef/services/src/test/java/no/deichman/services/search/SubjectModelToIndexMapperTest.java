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
public class SubjectModelToIndexMapperTest {
    private BaseURI baseURI = BaseURI.local();

    @Test
    public void testModelToIndexDocument() throws Exception {
        XURI subjetXuri1 = new XURI(baseURI.getBaseUriRoot(), EntityType.SUBJECT.getPath(), "e000000001");
        Model model = ModelFactory.createDefaultModel();
        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(subjetXuri1.getUri()),
                RDF.type,
                ResourceFactory.createResource(baseURI.ontology() + "Subject")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(subjetXuri1.getUri()),
                ResourceFactory.createProperty(baseURI.ontology() + "specification"),
                ResourceFactory.createPlainLiteral("Måte å lage klesplagg ved hjelp av to pinner og garn")));

        model.add(ResourceFactory.createStatement(
                ResourceFactory.createResource(subjetXuri1.getUri()),
                ResourceFactory.createProperty(baseURI.ontology() + "prefLabel"),
                ResourceFactory.createPlainLiteral("Strikking")));

        String jsonDocument = new ModelToIndexMapper("subject", BaseURI.local()).createIndexDocument(model, subjetXuri1);

        Assert.assertThat(jsonDocument, sameJSONAs(""
                + "{"
                + "  \"subject\": {"
                + "      \"uri\": \"" + subjetXuri1.getUri() + "\","
                + "      \"prefLabel\": \"Strikking\","
                + "      \"specification\": \"Måte å lage klesplagg ved hjelp av to pinner og garn\","
                + "  }\n"
                + "}").allowingAnyArrayOrdering());
    }
}
