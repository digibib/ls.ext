package no.deichman.services.patch;

import java.util.HashMap;
import java.util.Map;

public class PatchObject {

    private String op;
    private String s;
    private String p;
    private Map<String,String> o =  new HashMap<String,String>();

    PatchObject(){
    }

    public void setSubject(String uri) {
        s = uri;
    }

    public String getSubject() {
        return s;
    }

    public void setPredicate(String pred) {
        p = pred;
    }
    public String getPredicate() {
        return p;
    }

    public void setObjectValue(String obj) {
        o.put("value", obj);
    }

    public Map<String,String> getObject() {
        return o;
    }

    public void setObject(Map<String, String> object2) {
        o = object2;
    }

    public String getObjectValue() {
        return o.get("value").toString();
    }

    public String getObjectDatatype() {
        return o.get("datatype");
    }

    public String getObjectLanguage() {
        return o.get("lang");
    }

    public void setOperation(String operation2) {
        op = operation2;
    }

    public String getOperation() {
        return op;
    }
}
