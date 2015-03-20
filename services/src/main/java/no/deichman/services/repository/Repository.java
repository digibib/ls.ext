package no.deichman.services.repository;

import com.hp.hpl.jena.rdf.model.Model;

public interface Repository {
    
     public Model retrieveWorkById(String id);
    
}
