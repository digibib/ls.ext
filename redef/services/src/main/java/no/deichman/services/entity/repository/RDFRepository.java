package no.deichman.services.entity.repository;

import no.deichman.services.entity.patch.Patch;
import no.deichman.services.uridefaults.XURI;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Statement;

import java.util.List;
import java.util.Optional;
import java.util.function.Consumer;

/**
 * Responsibility: TODO.
 */
public interface RDFRepository {

    String createWork(Model model) throws Exception;
    String createPublication(Model model, String recordID) throws Exception;
    String createPerson(Model inputModel) throws Exception;
    String createPlaceOfPublication(Model inputModel) throws Exception;
    String createPublisher(Model inputModel) throws Exception;
    void createResource(Model model) throws Exception;

    void updateWork(String work);

    Model retrieveWorkAndLinkedResourcesByURI(XURI xuri);

    Model retrieveResourceByURI(XURI xuri);

    Model retrievePersonAndLinkedResourcesByURI(String uri);

    boolean askIfResourceExists(XURI xuri);

    boolean askIfStatementExists(Statement statement);

    void delete(Model inputModel);

    void patch(List<Patch> patches);

    Optional<String> getResourceURIByBibliofilId(String personId);

    Optional<String> getPlaceOfPublicationResourceURIByBibliofilId(String id);

    Optional<String> getPublisherResourceURIByBibliofilId(String bibliofilId);

    Model retrieveWorksByCreator(XURI xuri);

    Model retrievePublicationsByWork(XURI xuri);

    void findAllUrisOfType(String type, Consumer<String> uriConsumer);

    Optional<String> getResourceURIByBibliofilId(String id, String type);

}
