package no.deichman.services.search;

import org.apache.jena.rdf.model.Model;

import javax.ws.rs.core.Response;

/**
 * Responsibility: perform indexing and searching.
 */
public interface SearchService {
    void indexWorkModel(Model m);

    Response search(String query);
}
