package no.deichman.services.search;

import no.deichman.services.uridefaults.XURI;

import javax.ws.rs.core.MultivaluedMap;
import javax.ws.rs.core.Response;

/**
 * Responsibility: perform indexing and searching.
 */
public interface SearchService {
    void indexWork(XURI xuri) throws Exception;

    Response searchWork(String query);

    Response searchPerson(String query);

    void indexPerson(XURI xuri) throws Exception;

    void indexPlaceOfPublication(String id) throws Exception;

    void indexPublisher(String id) throws Exception;

    Response searchPersonWithJson(String json);

    Response searchWorkWithJson(String json, MultivaluedMap<String, String> queryParams);

    Response clearIndex();

    Response searchPlaceOfPublicationWithJson(String json);

    Response searchPlaceOfPublication(String query);

    Response searchPublisher(String query);
}
