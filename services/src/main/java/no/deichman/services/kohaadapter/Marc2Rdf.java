package no.deichman.services.kohaadapter;

import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;
import com.hp.hpl.jena.rdf.model.Statement;
import java.util.List;
import org.marc4j.marc.DataField;
import org.marc4j.marc.Record;
import org.marc4j.marc.VariableField;

import static com.hp.hpl.jena.rdf.model.ResourceFactory.createProperty;
import static com.hp.hpl.jena.rdf.model.ResourceFactory.createResource;
import static com.hp.hpl.jena.rdf.model.ResourceFactory.createStatement;

public class Marc2Rdf {

    public static Model mapRecordToModel(Record record) {

        final String NS = "http://deichman.no/exemplar/";

        Model model = ModelFactory.createDefaultModel();

        model.setNsPrefix("", NS);
        model.setNsPrefix("xsd", "http://www.w3.org/2001/XMLSchema#");

        List<VariableField> items = record.getVariableFields("952");

        for (VariableField itemField : items) {

            DataField itemData = (DataField) itemField;

            String resource = NS + itemData.getSubfield('p').getData();

            model.add(statement(
                            resource,
                            "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
                            "http://purl.org/vocab/frbr/core#Item")
            );

            model.add(statement(
                            resource,
                            "http://purl.org/deichman/status",
                            itemData.getSubfield('y').getData())
            );
            model.add(statement(
                            resource,
                            "http://purl.org/deichman/location",
                            itemData.getSubfield('a').getData())
            );
        }

        return model;
    }

    private static Statement statement(String subject, String property, String object) {
        return createStatement(
                createResource(subject),
                createProperty(property),
                createResource(object)
        );
    }
}
