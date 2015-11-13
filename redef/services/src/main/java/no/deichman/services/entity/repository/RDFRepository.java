package no.deichman.services.entity.repository;

import no.deichman.services.entity.patch.Patch;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Statement;

import java.util.List;
import java.util.Optional;

/**
 * Responsibility: TODO.
 */
public interface RDFRepository {

    String createWork(Model model);
    String createPublication(Model model, String recordID);
    String createPerson(Model inputModel);

    void updateWork(String work);
    Model retrieveWorkByURI(String uri);

    Model retrieveWorkAndLinkedResourcesByURI(String uri);

    Model retrievePublicationByURI(String uri);
    Model retrievePersonByURI(String uri);

    boolean askIfResourceExists(String uri);

    boolean askIfStatementExists(Statement statement);

    void delete(Model inputModel);

    void patch(List<Patch> patches);

    Optional<String> getResourceURIByBibliofilId(String personId);

    Model retrieveWorksByCreator(String creatorUri);

    Model retrievePublicationsByWork(String work);
}
