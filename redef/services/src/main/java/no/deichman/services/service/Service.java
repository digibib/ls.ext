package no.deichman.services.service;

import com.hp.hpl.jena.rdf.model.Model;

public interface Service {
    
    void updateWork(String work);
    Model listWork();
    Model retrieveWorkById(String id);
    Model retrieveWorkItemsById(String id);
	String createWork(String work);
}
