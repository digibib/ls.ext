package no.deichman.services.entity;

import javax.xml.xpath.XPathExpressionException;

import com.hp.hpl.jena.rdf.model.Model;
import no.deichman.services.entity.patch.PatchParserException;

/**
 * Responsibility: TODO.
 */
public interface EntityService {
    
    void updateWork(String work);
    Model retrieveWorkById(String id);
    Model retrieveWorkItemsById(String id);
    String createWork(String work);
    String createPublication(String publication) throws XPathExpressionException, Exception;
    void deleteWork(Model work);
    void deletePublication(Model publication);
    Model patchWork(String work, String ldPatchJson) throws PatchParserException;
    Model retrievePublicationById(String publicationId);
    Model patchPublication(String publicationId, String ldPatchJson) throws PatchParserException;
    boolean resourceExists(String resourceUri);
}
