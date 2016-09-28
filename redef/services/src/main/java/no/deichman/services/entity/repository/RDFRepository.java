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

    String createPublication(Model model, String recordId) throws Exception;

    String createPerson(Model inputModel) throws Exception;

    String createPlace(Model inputModel) throws Exception;

    String createCorporation(Model inputModel) throws Exception;

    String createSerial(Model inputModel) throws Exception;

    String createSubject(Model inputModel) throws Exception;

    String createGenre(Model inputModel) throws Exception;

    String createMusicalInstrument(Model inputModel) throws Exception;

    String createMusicalCompositionType(Model inputModel) throws Exception;

    String createEvent(Model inputModel) throws Exception;

    void createResource(Model model) throws Exception;

    void updateWork(String work);

    void updateResource(String query);

    XURI retrieveWorkByRecordId(String recordId) throws Exception;

    Model retrieveWorkAndLinkedResourcesByURI(XURI xuri);

    Model retrieveResourceByURI(XURI xuri);

    Model retrievePersonAndLinkedResourcesByURI(String uri);

    boolean askIfResourceExists(XURI xuri);

    boolean askIfStatementExists(Statement statement);

    void delete(Model inputModel);

    void patch(List<Patch> patches);

    List<String> getWorkURIsByAgent(XURI agent);

    Model retrieveWorksByCreator(XURI xuri);

    Model retrievePublicationsByWork(XURI xuri);

    void findAllUrisOfType(String type, Consumer<String> uriConsumer);

    Optional<String> getResourceURIByBibliofilId(String id, String type);

    Model retrieveCorporationAndLinkedResourcesByURI(String uri);

}
