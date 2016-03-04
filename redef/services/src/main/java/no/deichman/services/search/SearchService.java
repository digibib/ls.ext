package no.deichman.services.search;

import javax.ws.rs.core.MultivaluedMap;
import javax.ws.rs.core.Response;

/**
 * Responsibility: perform indexing and searching.
 */
public interface SearchService {
    void indexWork(String workUri);

    Response searchWork(String query);

    Response searchPerson(String query);

    void indexPerson(String personUri);

    void indexPlaceOfPublication(String id);

    void indexPublisher(String id);

    Response searchPersonWithJson(String json);

    Response searchWorkWithJson(String json, MultivaluedMap<String, String> queryParams);

    Response clearIndex();

    Response searchPlaceOfPublicationWithJson(String json);

    Response searchPlaceOfPublication(String query);

    Response searchPublisher(String query);
}
