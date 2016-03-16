package no.deichman.services.entity;

import no.deichman.services.entity.patch.PatchParserException;
import no.deichman.services.uridefaults.XURI;
import org.apache.jena.rdf.model.Model;

import java.util.Optional;
import java.util.function.Consumer;

/**
 * Responsibility: TODO.
 */
public interface EntityService {
    
    void updateWork(String work);
    Model retrieveById(EntityType type, String id);
    Model retrieveWorkWithLinkedResources(XURI xuri);
    Model retrievePersonWithLinkedResources(String id);

    Model retrieveWorkItemsById(String id);
    String create(EntityType type, Model inputModel);
    void delete(Model model);
    Model patch(EntityType type, String id, String ldPatchJson) throws PatchParserException;

    Model synchronizeKoha(EntityType type, String id);

    boolean resourceExists(String resourceUri);

    Model retrieveWorksByCreator(String creatorId);

    void retrieveAllWorkUris(String type, Consumer<String> uriConsumer);

    Optional<String> retrieveImportedResource(String id, String type);
}
