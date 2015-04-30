
package no.deichman.services.kohaadapter;

import com.hp.hpl.jena.rdf.model.Model;

public interface KohaAdapter {
    
    Model getBiblio(String biblioNo);
}
