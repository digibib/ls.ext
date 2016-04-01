package no.deichman.services.search;

import no.deichman.services.uridefaults.XURI;

import javax.ws.rs.core.MultivaluedMap;
import javax.ws.rs.core.Response;

/**
 * Responsibility: perform indexing and searching.
 */
public interface SearchService {
    void index(XURI xuri) throws Exception;

    Response searchWork(String query);

    Response searchPerson(String query);

    Response searchPersonWithJson(String json);

    Response searchWorkWithJson(String json, MultivaluedMap<String, String> queryParams);

    Response clearIndex();

    Response searchPlaceOfPublicationWithJson(String json);

    Response searchPlaceOfPublication(String query);

    Response searchPublisher(String query);

    Response searchSerial(String query);
}
