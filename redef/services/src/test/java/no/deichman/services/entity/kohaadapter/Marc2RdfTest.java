package no.deichman.services.entity.kohaadapter;

import static org.apache.jena.rdf.model.ResourceFactory.createPlainLiteral;
import static org.apache.jena.rdf.model.ResourceFactory.createProperty;
import static org.apache.jena.rdf.model.ResourceFactory.createResource;
import static org.apache.jena.rdf.model.ResourceFactory.createStatement;
import static org.apache.jena.rdf.model.ResourceFactory.createTypedLiteral;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import java.util.ArrayList;
import java.util.List;
import java.io.InputStream;

import org.apache.jena.datatypes.xsd.XSDDatatype;
import org.junit.Test;
import org.marc4j.MarcReader;
import org.marc4j.MarcXmlReader;
import org.marc4j.marc.Record;
import org.marc4j.marc.VariableField;

import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Statement;

import no.deichman.services.uridefaults.BaseURI;

public class Marc2RdfTest {

    private final String itemBase = "http://deichman.no/exemplar/";
    private final String ontologyNs = "http://deichman.no/ontology#";
    private final String duoNs = "http://data.deichman.no/utility#";

    @Test
    public void test_it_exists(){
        assertNotNull(new Marc2Rdf());
    }

    @Test
    public void test_baseURI_can_be_set_got(){
        BaseURI base = BaseURI.local();
        Marc2Rdf m2r = new Marc2Rdf();
        m2r.setBaseURI(base);
        assertNotNull(m2r.getBaseURI());
    }

    @Test
    public void test_default_constructor_sets_baseURI(){
        Marc2Rdf m2r = new Marc2Rdf();
        assertEquals(m2r.getBaseURI().getClass(), BaseURI.class);
    }

    @Test
    public void test_overloaded_constructor_sets_baseURI(){
        Marc2Rdf m2r = new Marc2Rdf(BaseURI.local());
        assertEquals(m2r.getBaseURI().getClass(), BaseURI.class);
    }

    @Test
    public void test_mapItemsToModel(){
        List<VariableField> itemsFields = new ArrayList<VariableField>();
        InputStream in = getClass().getClassLoader().getResourceAsStream("marc.xml");
        MarcReader reader = new MarcXmlReader(in);
        while (reader.hasNext()) {
            Record record = reader.next();
            itemsFields.addAll(record.getVariableFields("952"));
        }

        Marc2Rdf m2r = new Marc2Rdf(BaseURI.local());
        Model m = m2r.mapItemsToModel(itemsFields);

        String barcode = "03010626460038";

        String s = itemBase + barcode;

        Statement formatStatement = createStatement(
                createResource(s),
                createProperty(ontologyNs + "format"),
                createPlainLiteral("L"));
        Statement barcodeStatement = createStatement(
                createResource(s),
                createProperty(ontologyNs + "barcode"),
                createPlainLiteral(barcode)
        );
        Statement locationStatement = createStatement(
                createResource(s),
                createProperty(ontologyNs + "location"),
                createPlainLiteral("fmaj")
        );
        Statement shelfmarkStatement = createStatement(
                createResource(s),
                createProperty(duoNs + "shelfmark"),
                createPlainLiteral("Rag")
        );

        String loanedBarcode = "03010626460056";
        String sLoaned = itemBase + loanedBarcode;

        Statement loanedExample = createStatement(
                createResource(sLoaned),
                createProperty(ontologyNs + "status"),
                createPlainLiteral("2014-11-27")
        );

        Statement onloanAvailableStatement = createStatement(
                createResource(s),
                createProperty(duoNs + "onloan"),
                createTypedLiteral("false", XSDDatatype.XSDboolean)
        );

        Statement onloanLoanedStatement = createStatement(
                createResource(sLoaned),
                createProperty(duoNs + "onloan"),
                createTypedLiteral("true", XSDDatatype.XSDboolean)
        );

        assertNotNull(m);
        assertTrue(m.contains(formatStatement));
        assertTrue(m.contains(barcodeStatement));
        assertTrue(m.contains(locationStatement));
        assertFalse(m.listSubjectsWithProperty(createProperty(ontologyNs + "status")).toList().contains(s));
        assertTrue(m.contains(shelfmarkStatement));
        assertTrue(m.contains(loanedExample));
        assertTrue(m.contains(onloanAvailableStatement));
        assertTrue(m.contains(onloanLoanedStatement));
    }
}
