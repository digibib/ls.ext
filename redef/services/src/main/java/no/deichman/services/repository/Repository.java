package no.deichman.services.repository;

import com.hp.hpl.jena.rdf.model.Model;

public interface Repository {

	String createWork();

    void updateWork(String work);

    Model listWork();

    Model retrieveWorkById(String id);

    boolean askIfResourceExists(String uri);

}
