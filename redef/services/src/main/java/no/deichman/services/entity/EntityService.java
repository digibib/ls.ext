package no.deichman.services.entity;

import no.deichman.services.search.NameEntry;
import no.deichman.services.uridefaults.XURI;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.StmtIterator;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.function.Consumer;

/**
 * Responsibility: TODO.
 */
public interface EntityService {
    
    void updateWork(String work);
    Model retrieveById(XURI xuri);
    Model retrieveWorkWithLinkedResources(XURI xuri);
    Model retrievePersonWithLinkedResources(XURI xuri);

    Model retrieveCorporationWithLinkedResources(XURI xuri);

    XURI updateHoldingBranches(String recordId, String branches) throws Exception;

    Model retrieveWorkItemsByURI(XURI xuri);

    String create(EntityType type, Model inputModel) throws Exception;

    void delete(Model model);

    Model patch(XURI xuri, String ldPatchJson) throws Exception;

    Model synchronizeKoha(XURI xuri) throws Exception;

    boolean resourceExists(XURI xuri);

    Model retrieveWorksByCreator(XURI xuri);

    void retrieveAllWorkUris(String type, Consumer<String> uriConsumer);

    Optional<String> retrieveImportedResource(String id, String type);

    List<String> retrieveWorkRecordIds(XURI xuri);

    Map<String, Integer> getNumberOfRelationsForResource(XURI uri);

    Model retrieveResourceByQuery(EntityType entityType, Map<String, String> queryParameters, Collection<String> projection);

    Model retrieveEventWithLinkedResources(XURI eventUri);

    Model retrieveSerialWithLinkedResources(XURI serialUri);

    Set<String> retrieveResourcesConnectedTo(XURI xuri);

    Collection<NameEntry> neighbourhoodOfName(EntityType type, String name, int width);

    List<RelationshipGroup> retrieveResourceRelationships(XURI uri);

    void addIndexedName(EntityType type, String name, String uri);

    StmtIterator statementsInModelAbout(final XURI xuri, final Model indexModel, final String... predicates);

    void mergeResource(XURI xuri, XURI replaceeUri);

    void removeFromLocalIndex(XURI xuri);

    List<XURI> retrieveResourceRelationshipsUris(XURI uri);
}
