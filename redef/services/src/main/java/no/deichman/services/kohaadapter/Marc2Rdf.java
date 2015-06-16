package no.deichman.services.kohaadapter;

import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;
import com.hp.hpl.jena.rdf.model.Statement;
import org.marc4j.marc.DataField;
import org.marc4j.marc.VariableField;

import java.util.List;

import static com.hp.hpl.jena.rdf.model.ResourceFactory.createProperty;
import static com.hp.hpl.jena.rdf.model.ResourceFactory.createResource;
import static com.hp.hpl.jena.rdf.model.ResourceFactory.createStatement;

class Marc2Rdf {

    private static final String DEICHMAN_NS_EXEMPLAR = "http://deichman.no/exemplar/";
    private static final String RDF_SYNTAX_NS_TYPE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
    private static final String DEICHMAN_FORMAT = "http://purl.org/deichman/format";
    private static final String FRBR_CORE_ITEM = "http://purl.org/vocab/frbr/core#Item";
    private static final String DEICHMAN_STATUS = "http://purl.org/deichman/status";
    private static final String DEICHMAN_LOCATION = "http://purl.org/deichman/location";

    public Model mapItemsToModel(List<VariableField> itemsFields) {

        Model model = ModelFactory.createDefaultModel();

        model.setNsPrefix("", DEICHMAN_NS_EXEMPLAR);
        model.setNsPrefix("xsd", "http://www.w3.org/2001/XMLSchema#");

        for (VariableField itemField : itemsFields) {
            DataField itemData = (DataField) itemField;
            String s = DEICHMAN_NS_EXEMPLAR + itemData.getSubfield('p').getData();
            model.add(stmt(s, RDF_SYNTAX_NS_TYPE, FRBR_CORE_ITEM));
            model.add(stmt(s, DEICHMAN_FORMAT, itemData.getSubfield('y').getData()));
            model.add(stmt(s, DEICHMAN_STATUS, itemData.getSubfield('q') != null ? itemData.getSubfield('q').getData() : "AVAIL"));
            model.add(stmt(s, DEICHMAN_LOCATION, itemData.getSubfield('a').getData()));
        }
        return model;
    }

    private Statement stmt(String subject, String property, String object) {
        return createStatement(
                createResource(subject),
                createProperty(property),
                createResource(object)
        );
    }
}
