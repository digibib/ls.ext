package no.deichman.services.entity.patch;

import org.apache.jena.datatypes.TypeMapper;
import org.apache.jena.rdf.model.RDFNode;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdf.model.Statement;
import org.apache.jena.vocabulary.XSD;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import static org.apache.jena.rdf.model.ResourceFactory.createLangLiteral;
import static org.apache.jena.rdf.model.ResourceFactory.createPlainLiteral;
import static org.apache.jena.rdf.model.ResourceFactory.createProperty;
import static org.apache.jena.rdf.model.ResourceFactory.createResource;
import static org.apache.jena.rdf.model.ResourceFactory.createStatement;
import static org.apache.jena.rdf.model.ResourceFactory.createTypedLiteral;

/**
 * Responsibility: TODO.
 */
final class PatchObject {

    private String op;
    private String s;
    private String p;
    private Map<String, String> o = new HashMap<String, String>();

    public static boolean isBlankNodeUri(String objectValue) {
        return objectValue.startsWith("_:");
    }


    private RDFNode getDataTypeNode(Map<String, RDFNode> blankNodes) {
        RDFNode rdfNode = null;
        String datatype = getObjectDatatype();

        String objectValue = null;
        try {
            objectValue = getObjectValue();
        } catch (PatchParserException e) {
            e.printStackTrace();
        }
        if (datatype.contentEquals(XSD.anyURI.getURI())) {
            if (isBlankNodeUri(objectValue)) {
                if (!blankNodes.containsKey(objectValue)) {
                    rdfNode = createResource();
                    blankNodes.put(objectValue, rdfNode);
                } else {
                    rdfNode = blankNodes.get(objectValue);
                }
            } else {
                rdfNode = createResource(objectValue);
            }
        } else {
            TypeMapper typeMapper = new TypeMapper();
            rdfNode = createTypedLiteral(objectValue, typeMapper.getSafeTypeByName(datatype));
        }

        return rdfNode;
    }

    PatchObject() {
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

    public Patch toPatch(Map<String, RDFNode> blankNodes) throws PatchParserException {

        RDFNode rdfNode;
        if (getObjectLanguage() != null && getObjectValue() != null) {
            rdfNode = createLangLiteral(getObjectValue(), getObjectLanguage());
        } else if (getObjectDatatype() != null && getObjectValue() != null) {
            rdfNode = getDataTypeNode(blankNodes);
        } else if (getObjectValue() != null) {
            rdfNode = createPlainLiteral(getObjectValue());
        } else {
            throw new PatchParserException("No object was found");
        }

        Resource subject = blankNodes.containsKey(getSubject()) ? blankNodes.get(getSubject()).asResource() : createResource(getSubject());
        Statement statement = createStatement(
                subject,
                createProperty(getPredicate()),
                rdfNode);

        return new Patch(op, statement, null);
    }

    public Patch toPatch() throws PatchParserException {
        return toPatch(Collections.emptyMap());
    }
}
