
package no.deichman.services.entity.kohaadapter;

import org.apache.jena.rdf.model.Model;

/**
 * Responsibility: TODO.
 */
public interface KohaAdapter {
    Model getBiblio(String biblioNo);
    String getNewBiblio();
}
