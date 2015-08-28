
package no.deichman.services.entity.kohaadapter;

import com.hp.hpl.jena.rdf.model.Model;

/**
 * Responsibility: TODO.
 */
public interface KohaAdapter {
    Model getBiblio(String biblioNo);
    String getNewBiblio();
}
