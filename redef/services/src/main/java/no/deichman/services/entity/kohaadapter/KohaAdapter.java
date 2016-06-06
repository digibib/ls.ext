
package no.deichman.services.entity.kohaadapter;

import org.apache.jena.rdf.model.Model;

import javax.ws.rs.core.Response;

/**
 * Responsibility: TODO.
 */
public interface KohaAdapter {
    Model getBiblio(String biblioNo);

    String createNewBiblio();

    String createNewBiblioWithMarcRecord(MarcRecord marcRecord);

    String retrieveMarcXml(String recordId);

    Response updateRecord(String id, MarcRecord marcRecord);
}
