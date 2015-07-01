package no.deichman.services.utils;


import java.util.HashMap;
import java.util.Map;

import com.hp.hpl.jena.vocabulary.RDFS;

import no.deichman.services.uridefaults.BaseURI;
    
public class DefaultPrefixes {

    Map<String,String> prefixMapping = new HashMap<String,String>();
    BaseURI baseURI;

    DefaultPrefixes(){
    }

    DefaultPrefixes(BaseURI baseURI){
        this.baseURI = baseURI;
        setPrefixes();
    }
    
    private void setPrefixes(){
        prefixMapping.put("rdfs", RDFS.getURI());
        prefixMapping.put("deichman", this.baseURI.getOntologyURI());
    }

    public void set(String prefix, String ns){
        prefixMapping.put(prefix, ns);
    }

    public String get(String prefix) {
        return prefixMapping.get(prefix);
    }

    public Map<String, String> getAll() {
        return prefixMapping;
    }
}
