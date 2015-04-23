package no.deichman.services.service;

import com.hp.hpl.jena.rdf.model.Model;

public interface Service {
    
    void createWork(String work);
    Model listWork();
    Model retriveWorkById(String id);
    Model retrieveWorkItemsById(String id);
}
