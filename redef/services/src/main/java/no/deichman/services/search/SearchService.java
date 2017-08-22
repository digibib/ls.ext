package no.deichman.services.search;

import no.deichman.services.entity.EntityType;
import no.deichman.services.uridefaults.XURI;

import javax.ws.rs.core.MultivaluedMap;
import javax.ws.rs.core.Response;
import java.util.Collection;
import java.util.Map;
import java.util.Set;

/**
 * Responsibility: perform indexing and searching.
 */
public interface SearchService {
    void index(XURI xuri);

    void indexOnly(XURI xuri) throws Exception;

    Response searchWork(String query);

    Response searchPerson(String query);

    Response searchPersonWithJson(String json);

    Response searchWorkWithJson(String json, MultivaluedMap<String, String> queryParams);

    Response clearIndex();

    Response searchPlace(String query);

    Response searchCorporation(String query);

    Response searchSerial(String query);

    Response searchSubject(String query);

    Response searchGenre(String query);

    Response searchPublication(String query);

    Response searchPublicationWithJson(String json);

    Response searchInstrument(String query);

    Response searchCompositionType(String query);

    Response searchEvent(String query);

    void delete(XURI xuri);

    Response sortedList(String type, String prefix, int minSize, String field);

    Response searchWorkWhereUriIsSubject(String subjectUri, int maxSize);

    Response searchWorkSeries(String query);

    void enqueueIndexingAllResources();

    void enqueueIndexingAllOfType(String type, Boolean ignoreConnectedResources);

    void enqueueIndexing(Set<String> uris, XURI triggeredBy);

    Map<String, String> getAllSortLabelsForType(EntityType type);

    Collection<NameEntry> neighbourhoodOfName(EntityType type, String name, int width);

    void addIndexedName(EntityType type, String name, String uri);

    void removeFromLocalIndex(XURI xuri);
}
