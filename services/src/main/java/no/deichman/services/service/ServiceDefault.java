package no.deichman.services.service;

import com.hp.hpl.jena.rdf.model.Model;
import no.deichman.services.repository.Repository;
import no.deichman.services.repository.RepositoryDefault;

public class ServiceDefault implements Service {

    private static Repository repository = new RepositoryDefault();

    @Override
    public Model retriveWorkById(String id) {
        return repository.retrieveWorkById(id);
    }
    
    public static void setRepository(Repository repository) {
        ServiceDefault.repository = repository;
    }

    @Override
    public Model listWork() {
        return repository.listWork();
    }
}
