package no.deichman.services.entity.kohaadapter;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import no.deichman.services.entity.EntityServiceImplTest;
import no.deichman.services.uridefaults.BaseURI;
import org.apache.commons.io.IOUtils;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Statement;
import org.junit.Test;

import java.io.IOException;

import static org.apache.jena.rdf.model.ResourceFactory.createPlainLiteral;
import static org.apache.jena.rdf.model.ResourceFactory.createProperty;
import static org.apache.jena.rdf.model.ResourceFactory.createResource;
import static org.apache.jena.rdf.model.ResourceFactory.createStatement;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

public class KohaItem2RdfTest {

    private final String itemBase = "http://data.deichman.no/exemplar/";
    private final String duoNs = "http://data.deichman.no/utility#";

    @Test
    public void test_it_exists(){
        assertNotNull(new KohaItem2Rdf());
    }

    @Test
    public void test_mapItemsToModel() throws IOException {
        String in = IOUtils.toString(
                EntityServiceImplTest.class.getClassLoader().getResourceAsStream("biblio_expanded.json"),
                "UTF-8"
        );
        JsonObject json = new Gson().fromJson(in, JsonObject.class);
        KohaItem2Rdf m2r = new KohaItem2Rdf();
        Model m = m2r.mapItemsToModel(json.getAsJsonArray("items"));

        String barcode = "03010626460038";

        String s = itemBase + "e" + barcode;

        Statement barcodeStatement = createStatement(
                createResource(s),
                createProperty(BaseURI.ontology("barcode")),
                createPlainLiteral(barcode)
        );
        Statement locationStatement = createStatement(
                createResource(s),
                createProperty(BaseURI.ontology("location")),
                createPlainLiteral("m")
        );
        Statement branchStatement = createStatement(
                createResource(s),
                createProperty(BaseURI.ontology("branch")),
                createPlainLiteral("Hovedbiblioteket")
        );
        Statement shelfmarkStatement = createStatement(
                createResource(s),
                createProperty(duoNs + "shelfmark"),
                createPlainLiteral("952 Cri")
        );

        String loanedBarcode = "03010626460056";
        String sLoaned = itemBase + "e" + loanedBarcode;

        Statement loanedExample = createStatement(
                createResource(sLoaned),
                createProperty(BaseURI.ontology("status")),
                createPlainLiteral("Utlånt")
        );

        Statement availableStatement = createStatement(
                createResource(s),
                createProperty(BaseURI.ontology("status")),
                createPlainLiteral("Ledig")
        );


        assertNotNull(m);
        assertTrue(m.contains(branchStatement));
        assertTrue(m.contains(barcodeStatement));
        assertTrue(m.contains(locationStatement));
        assertFalse(m.listSubjectsWithProperty(createProperty(BaseURI.ontology("status"))).toList().contains(s));
        assertTrue(m.contains(shelfmarkStatement));
        assertTrue(m.contains(loanedExample));
        assertTrue(m.contains(availableStatement));
    }
}
