package no.deichman.services.search;

import javax.ws.rs.core.Response;

/**
 * Responsibility: perform indexing and searching.
 */
public interface SearchService {
    void indexWork(String workUri);

    Response searchWork(String query);

    Response searchPerson(String query);

    void indexPerson(String personUri);

    Response searchPersonWithJson(String json);

    Response searchWorkWithJson(String json);

    Response clearIndex();

    void indexPlaceOfPublication(String id);

    Response searchPlaceOfPublicationWithJson(String json);

    Response searchPlaceOfPublication(String query);
}
