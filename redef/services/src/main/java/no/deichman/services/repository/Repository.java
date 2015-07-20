package no.deichman.services.repository;

import java.util.List;

import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.Statement;

import no.deichman.services.patch.Patch;

public interface Repository {

    String createWork(String work);
    String createPublication(String publication);

    void updateWork(String work);
    Model retrieveWorkById(String id);

    boolean askIfResourceExists(String uri);
    boolean askIfStatementExists(Statement statement);
    boolean askIfStatementExistsInGraph(Statement statement, String graph);

    void update(Model inputModel);
    void updateNamedGraph(Model inputModel, String graph);
    void delete(Model inputModel);
    void deleteFromNamedGraph(Model inputModel, String graph);
    void dump();
    boolean askIfResourceExistsInGraph(String uri, String graph);

    boolean askIfGraphExists(String graph);
    void patch(List<Patch> patches) throws Exception;

}
