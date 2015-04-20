package no.deichman.services.repository;

import com.hp.hpl.jena.rdf.model.Model;

public interface Repository {

    void createWork(String work);
    
    Model listWork();

    Model retrieveWorkById(String id);
}
