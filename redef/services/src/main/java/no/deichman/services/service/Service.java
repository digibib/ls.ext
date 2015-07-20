package no.deichman.services.service;

import java.io.UnsupportedEncodingException;

import com.hp.hpl.jena.rdf.model.Model;

import no.deichman.services.error.PatchException;
import no.deichman.services.error.PatchParserException;
import no.deichman.services.repository.Repository;

public interface Service {
    
    void setRepository(Repository repository);
    Repository getRepository();
    void updateWork(String work);
    Model retrieveWorkById(String id);
    Model retrieveWorkItemsById(String id);
    String createWork(String work);
    String createPublication(String publication);
    void deleteWork(Model work);
    Model patchWork(String work, String requestBody) throws UnsupportedEncodingException, PatchException, PatchParserException, Exception;
    Model retrievePublicationById(String publicationId);
}
