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

	void update(Model inputModel);
	void updateNamedGraph(Model inputModel, String graph);
	void delete(Model inputModel);
	void deleteFromNamedGraph(Model inputModel, String graph);
	void dump();
	boolean askIfResourceExistsInGraph(String uri, String graph);

	boolean askIfGraphExists(String graph);

}
