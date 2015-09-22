package no.deichman.services.entity.kohaadapter;

import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.rdf.model.ResourceFactory;
import org.apache.jena.rdf.model.Statement;
import org.apache.jena.rdf.model.Model;

import no.deichman.services.uridefaults.BaseURI;

import org.marc4j.marc.DataField;
import org.marc4j.marc.VariableField;

import java.util.List;

import static org.apache.jena.rdf.model.ResourceFactory.createProperty;
import static org.apache.jena.rdf.model.ResourceFactory.createResource;
import static org.apache.jena.rdf.model.ResourceFactory.createStatement;

/**
 * Responsibility: TODO.
 */
public final class Marc2Rdf {

    private static final String DEICHMAN_NS_EXEMPLAR = "http://deichman.no/exemplar/";
    private static final String RDF_SYNTAX_NS_TYPE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
    private static final String DEICHMAN_FORMAT = "format";
    private static final String DEICHMAN_ITEM = "Item";
    private static final String DEICHMAN_STATUS = "status";
    private static final String DEICHMAN_LOCATION = "location";
    private static final String DEICHMAN_BARCODE = "barcode";
    private static final String DUO_SHELFMARK = "shelfmark";
    private static final String DUO_NS = "http://data.deichman.no/utility#";
    private BaseURI baseURI;

    public Marc2Rdf(){
        baseURI = BaseURI.remote();
    }

    public Marc2Rdf(BaseURI base) {
        baseURI = base;
    }

    public void setBaseURI(BaseURI base){
        baseURI = base;
    }

    public BaseURI getBaseURI(){
        return baseURI;
    }

    public Model mapItemsToModel(List<VariableField> itemsFields) {

        Model model = ModelFactory.createDefaultModel();

        model.setNsPrefix("", DEICHMAN_NS_EXEMPLAR);
        model.setNsPrefix("duo", DUO_NS);
        model.setNsPrefix("xsd", "http://www.w3.org/2001/XMLSchema#");

        for (VariableField itemField : itemsFields) {
            DataField itemData = (DataField) itemField;
            String s = DEICHMAN_NS_EXEMPLAR + itemData.getSubfield('p').getData();
            model.add(stmt(s, RDF_SYNTAX_NS_TYPE, baseURI.ontology() + DEICHMAN_ITEM));
            model.add(stmtLiteral(s, baseURI.ontology() + DEICHMAN_FORMAT, itemData.getSubfield('y').getData()));
            model.add(stmtLiteral(s, baseURI.ontology() + DEICHMAN_STATUS, itemData.getSubfield('q') != null ? itemData.getSubfield('q').getData() : "AVAIL"));
            model.add(stmtLiteral(s, baseURI.ontology() + DEICHMAN_LOCATION, itemData.getSubfield('a').getData()));
            model.add(stmtLiteral(s, baseURI.ontology() + DEICHMAN_BARCODE, itemData.getSubfield('p').getData()));
            model.add(stmtLiteral(s, DUO_NS + DUO_SHELFMARK, itemData.getSubfield('o').getData()));
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
    private Statement stmtLiteral(String subject, String property, String object) {

        return createStatement(
                createResource(subject),
                createProperty(property),
                ResourceFactory.createPlainLiteral(object)
        );
    }
}
