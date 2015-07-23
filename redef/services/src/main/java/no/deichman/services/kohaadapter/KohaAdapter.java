
package no.deichman.services.kohaadapter;

import com.hp.hpl.jena.rdf.model.Model;

/**
 * Responsibility: TODO.
 */
public interface KohaAdapter {
    Model getBiblio(String biblioNo);
}
