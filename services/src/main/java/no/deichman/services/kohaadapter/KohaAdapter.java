
package no.deichman.services.kohaadapter;

import com.hp.hpl.jena.rdf.model.Model;

public interface KohaAdapter {
    
    public Model getBiblio(String biblioNo);

}
