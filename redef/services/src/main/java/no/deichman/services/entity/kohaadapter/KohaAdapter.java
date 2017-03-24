
package no.deichman.services.entity.kohaadapter;

import org.apache.jena.rdf.model.Model;

import javax.ws.rs.core.Response;

/**
 * Responsibility: Handle creating and updating bibliographic records and items in Koha.
 */
public interface KohaAdapter {
    Model getBiblio(String biblioNo);

    String createNewBiblio();

    String createNewBiblioWithMarcRecord(MarcRecord marcRecord);

    String retrieveBiblioMARCXML(String recordId);

    String retrieveBiblioExpanded(String recordId);

    Response updateRecord(String id, MarcRecord marcRecord);

    void deleteBiblio(String recordId) throws PublicationHasItemsException;

    String getBiblioFromItemNumber(String recordId);

    String getCheckouts(String userId);

    String getHolds(String userId);
}
