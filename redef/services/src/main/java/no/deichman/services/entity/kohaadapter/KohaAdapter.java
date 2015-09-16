
package no.deichman.services.entity.kohaadapter;

import org.apache.jena.rdf.model.Model;

import java.util.Map;

/**
 * Responsibility: TODO.
 */
public interface KohaAdapter {
    Model getBiblio(String biblioNo);
    String getNewBiblio();

    String getNewBiblioWithItems(Map<Character, String>... itemSubfieldMap);
}
