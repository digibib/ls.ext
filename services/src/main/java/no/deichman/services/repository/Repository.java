package no.deichman.services.repository;

import com.hp.hpl.jena.rdf.model.Model;

public interface Repository {

    public void createWork(String work);
    
    public Model listWork();

    public Model retrieveWorkById(String id);
}
