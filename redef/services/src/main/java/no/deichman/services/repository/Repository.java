package no.deichman.services.repository;

import java.util.List;

import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.Statement;

import no.deichman.services.patch.Patch;

/**
 * Responsibility: TODO.
 */
public interface Repository {

    String createWork(String work);
    String createPublication(String publication);

    void updateWork(String work);
    Model retrieveWorkById(String id);
    Model retrievePublicationById(String id);

    boolean askIfResourceExists(String uri);
    boolean askIfStatementExists(Statement statement);

    void delete(Model inputModel);

    void patch(List<Patch> patches);

}
