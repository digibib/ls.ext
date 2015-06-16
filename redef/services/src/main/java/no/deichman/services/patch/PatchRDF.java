package no.deichman.services.patch;


import java.io.UnsupportedEncodingException;

import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;

import no.deichman.services.error.PatchException;
import no.deichman.services.repository.Repository;

public class PatchRDF {

    Repository repository = null;

    public void patch(Repository repo, Patch patch) throws UnsupportedEncodingException, PatchException {
        repository = repo;

        if (patch.getOperation().equals("add")) {
            addTriple(patch);
        } else if (patch.getOperation().equals("del")) {
            deleteTriple(patch);
        }
    }

    private void addTriple(Patch patch) throws UnsupportedEncodingException, PatchException {
        if (repository.askIfGraphExists(patch.getGraph()) == false && patch.getGraph() != null) {
            throw new PatchException("Attempting to patch a nonexistent graph <" + patch.getGraph() + ">");
        } else if (repository.askIfResourceExists(patch.getStatement().getSubject().getURI()) == false && patch.getGraph() == null) {
            throw new PatchException("Attempting to patch a nonexistent resource [default graph]");
        } else if (repository.askIfResourceExistsInGraph(patch.getStatement().getSubject().getURI(), patch.getGraph()) == false && patch.getGraph() != null){
            throw new PatchException("Attempting to patch a nonexistent resource in named graph <" + patch.getGraph() +">");
        }

        if (exists(patch) == false) {
            Model m = ModelFactory.createDefaultModel();
            m.add(patch.getStatement());
            if (patch.getGraph() == null) {
                repository.update(m);
            } else {
                repository.updateNamedGraph(m,patch.getGraph());
            }
        } else {
            throw new PatchException("Triple already exists");
        }
    }

    private void deleteTriple(Patch patch) throws PatchException, UnsupportedEncodingException {
        if (exists(patch) == true) {
            Model m = ModelFactory.createDefaultModel();
            m.add(patch.getStatement());
            if (patch.getGraph() == null) {
                repository.delete(m);
            } else {
                repository.deleteFromNamedGraph(m,patch.getGraph());
            }
        } else {
            throw new PatchException("Triple does not exist");
        }
    }

    private boolean exists(Patch patch) throws UnsupportedEncodingException {
        boolean result = false;
        if (patch.getGraph() != (null)) {
            result = repository.askIfStatementExistsInGraph(patch.getStatement(), patch.getGraph());
        } else {
            result = repository.askIfStatementExists(patch.getStatement());
        }
        return result;
    }

}
