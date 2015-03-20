/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package no.deichman.services.service;

import com.hp.hpl.jena.rdf.model.Model;
import no.deichman.services.repository.Repository;
import no.deichman.services.repository.RepositoryDefault;
import no.deichman.services.repository.RepositoryInMemory;

/**
 *
 * @author sbd
 */
public class ServiceDefault implements Service {

    private static final Repository REPOSITORY = new RepositoryInMemory();

    @Override
    public Model retriveWorkById(String id) {
        return REPOSITORY.retrieveWorkById(id);
    }
}
