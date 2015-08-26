package no.deichman.services.entity.kohaadapter;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import java.util.ArrayList;
import java.util.List;
import java.io.InputStream;

import org.junit.Test;
import org.marc4j.MarcReader;
import org.marc4j.MarcXmlReader;
import org.marc4j.marc.Record;
import org.marc4j.marc.VariableField;

import com.hp.hpl.jena.rdf.model.Literal;
import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.Property;
import com.hp.hpl.jena.rdf.model.Resource;
import com.hp.hpl.jena.rdf.model.ResourceFactory;
import com.hp.hpl.jena.rdf.model.Statement;

import no.deichman.services.uridefaults.BaseURI;

public class Marc2RdfTest {
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
        Resource s = ResourceFactory.createResource("http://deichman.no/exemplar/03010626460038");
        Property p = ResourceFactory.createProperty("http://deichman.no/ontology#format");
        Literal o = ResourceFactory.createPlainLiteral("L");
        Statement stmt = ResourceFactory.createStatement(s, p, o);
        assertNotNull(m);
        assertTrue(m.contains(stmt));
        
    }
}
