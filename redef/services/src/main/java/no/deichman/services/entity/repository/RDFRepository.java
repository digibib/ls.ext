package no.deichman.services.entity.repository;

import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.Statement;
import java.util.List;
import no.deichman.services.entity.patch.Patch;

/**
 * Responsibility: TODO.
 */
public interface RDFRepository {

    String createWork(String work);
    String createPublication(String publication, String recordID);

    void updateWork(String work);
    Model retrieveWorkById(String id);
    Model retrievePublicationById(String id);

    boolean askIfResourceExists(String uri);

    boolean askIfStatementExists(Statement statement);

    void delete(Model inputModel);

    void patch(List<Patch> patches);

}
