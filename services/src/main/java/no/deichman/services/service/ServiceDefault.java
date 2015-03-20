package no.deichman.services.service;

import com.hp.hpl.jena.rdf.model.Model;
import no.deichman.services.repository.Repository;
import no.deichman.services.repository.RepositoryInMemory;

public class ServiceDefault implements Service {

    private static final Repository REPOSITORY = new RepositoryInMemory();

    @Override
    public Model retriveWorkById(String id) {
        return REPOSITORY.retrieveWorkById(id);
    }
}
