package no.deichman.services.entity.patch;

import org.apache.jena.datatypes.TypeMapper;
import org.apache.jena.rdf.model.RDFNode;
import org.apache.jena.rdf.model.ResourceFactory;
import org.apache.jena.rdf.model.Statement;
import org.apache.jena.vocabulary.XSD;

import java.util.HashMap;
import java.util.Map;

/**
 * Responsibility: TODO.
 */
final class PatchObject {

    private String op;
    private String s;
    private String p;
    private Map<String,String> o =  new HashMap<String,String>();

    private RDFNode getDataTypeNode() {
        RDFNode rdfNode = null;
        String datatype = getObjectDatatype();

        if (datatype.contentEquals(XSD.anyURI.getURI())) {
            try {
                rdfNode = ResourceFactory.createResource(getObjectValue());
            } catch (PatchParserException e) {
                e.printStackTrace();
            }
        } else {
            TypeMapper typeMapper = new TypeMapper();
            try {
                rdfNode = ResourceFactory.createTypedLiteral(getObjectValue(), typeMapper.getSafeTypeByName(datatype));
            } catch (PatchParserException e) {
                e.printStackTrace();
            }
        }

        return rdfNode;
    }

    PatchObject(){
    }

    public void setSubject(String uri) {
        s = uri;
    }

    public String getSubject() throws PatchParserException {
        if (s != null) {
            return s;
        } else {
            throw new PatchParserException("No subject was found");
        }
    }

    public void setPredicate(String pred) {
        p = pred;
    }
    public String getPredicate() throws PatchParserException {
        if (p != null) {
            return p;
        } else {
            throw new PatchParserException("No predicate was found");
        }
    }

    public void setObjectValue(String obj) {
        o.put("value", obj);
    }

    public Map<String, String> getObject() {
        return o;
    }

    public void setObject(Map<String, String> object2) {
        o = object2;
    }

    public String getObjectValue() throws PatchParserException {
        if (o.get("value") != null) {
            return o.get("value");
        } else {
            throw new PatchParserException("No object value was found");
        }
    }

    public String getObjectDatatype() {
        return o.get("type");
    }

    public String getObjectLanguage() {
        return o.get("lang");
    }

    public void setOperation(String operation2) {
        op = operation2;
    }

    public String getOperation() throws PatchParserException {
        if (op != null) {
            return op;
        } else {
            throw new PatchParserException("No operation was found");
        }
    }

    public Patch toPatch() throws PatchParserException {

        RDFNode rdfNode;
        if (getObjectLanguage() != null && getObjectValue() != null){
            rdfNode = ResourceFactory.createLangLiteral(getObjectValue(), getObjectLanguage());
        } else if (getObjectDatatype() != null && getObjectValue() != null) {
            rdfNode = getDataTypeNode();
        } else if (getObjectValue() != null) {
            rdfNode = ResourceFactory.createPlainLiteral(getObjectValue());
        } else {
            throw new PatchParserException("No object was found");
        }

        Statement statement = ResourceFactory.createStatement(
                ResourceFactory.createResource(getSubject()),
                ResourceFactory.createProperty(getPredicate()),
                rdfNode);

        return new Patch(op, statement, null);
    }
}
