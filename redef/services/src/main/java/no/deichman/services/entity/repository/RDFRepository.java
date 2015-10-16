package no.deichman.services.entity.repository;

import no.deichman.services.entity.patch.Patch;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Statement;

import java.util.List;

/**
 * Responsibility: TODO.
 */
public interface RDFRepository {

    String createWork(Model model);
    String createPublication(Model model, String recordID);
    String createPerson(Model inputModel);

    void updateWork(String work);
    Model retrieveWorkById(String id);
    Model retrievePublicationById(String id);
    Model retrievePersonById(String id);

    boolean askIfResourceExists(String uri);

    boolean askIfStatementExists(Statement statement);

    void delete(Model inputModel);

    void patch(List<Patch> patches);

}
