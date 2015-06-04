package no.deichman.services.repository;

import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.Statement;

public interface Repository {

	String createWork(String work);

    void updateWork(String work);

    Model listWork();

    Model retrieveWorkById(String id);

    boolean askIfResourceExists(String uri);
    boolean askIfStatementExists(Statement statement);
    boolean askIfStatementExistsInGraph(Statement statement, String graph);

}
