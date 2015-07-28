package no.deichman.services.service;

import com.hp.hpl.jena.rdf.model.Model;
import no.deichman.services.error.PatchParserException;

/**
 * Responsibility: TODO.
 */
public interface Service {
    
    void updateWork(String work);
    Model retrieveWorkById(String id);
    Model retrieveWorkItemsById(String id);
    String createWork(String work);
    String createPublication(String publication);
    void deleteWork(Model work);
    void deletePublication(Model publication);
    Model patchWork(String work, String requestBody) throws PatchParserException;
    Model retrievePublicationById(String publicationId);
    Model patchPublication(String publicationId, String requestBody) throws PatchParserException;
    boolean resourceExists(String resourceUri);
}
