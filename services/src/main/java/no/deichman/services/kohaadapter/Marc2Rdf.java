package no.deichman.services.kohaadapter;

import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;
import com.hp.hpl.jena.rdf.model.Property;
import com.hp.hpl.jena.rdf.model.Resource;
import com.hp.hpl.jena.rdf.model.ResourceFactory;
import com.hp.hpl.jena.rdf.model.Statement;
import java.util.Iterator;
import java.util.List;
import org.marc4j.marc.DataField;
import org.marc4j.marc.Record;

public class Marc2Rdf {

    static final String NS = "http://deichman.no/exemplar/";
    static String resource;

    public static Model mapRecordToModel(Record record) {

        Model model = ModelFactory.createDefaultModel();

        model.setNsPrefix("", NS);
        model.setNsPrefix("xsd", "http://www.w3.org/2001/XMLSchema#");

        // Fetches all the items by getting all 952-fields:
        List exemplars = record.getVariableFields("952");
        Iterator i = exemplars.iterator();
        while (i.hasNext()) {
            DataField d = (DataField) i.next();
            model.add(mapIdToStatement(d.getSubfield('p').getData()));
            model.add(mapLocationToStatement(d.getSubfield('a').getData()));
            if (d.getSubfield('q') != null) {
                model.add(mapStatusToStatement(d.getSubfield('q').getData()));
            }
        }

        return model;
    }

    private static Statement mapIdToStatement(String id) {
        setResource(id);
        Resource s = ResourceFactory.createResource(resource);
        Property p = ResourceFactory.createProperty("http://www.w3.org/1999/02/22-rdf-syntax-ns#type");
        Resource o = ResourceFactory.createResource("http://purl.org/vocab/frbr/core#Item");

        return ResourceFactory.createStatement(s, p, o);
    }

    private static Statement mapLocationToStatement(String location) {
        Resource s = ResourceFactory.createResource(resource);
        Property p = ResourceFactory.createProperty("http://purl.org/deichman/location");
        Resource o = ResourceFactory.createResource(location);

        return ResourceFactory.createStatement(s, p, o);
    }

    private static Statement mapStatusToStatement(String status) {
        Resource s = ResourceFactory.createResource(resource);
        Property p = ResourceFactory.createProperty("http://purl.org/deichman/status");
        Resource o = ResourceFactory.createResource(status);

        return ResourceFactory.createStatement(s, p, o);
    }

    static private void setResource(String id) {
        resource = new String(NS + id);
    }
}
