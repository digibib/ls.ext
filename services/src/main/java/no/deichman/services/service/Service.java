package no.deichman.services.service;

import com.hp.hpl.jena.rdf.model.Model;

public interface Service {
    
    Model listWork();
    Model retriveWorkById(String id);
    
}
