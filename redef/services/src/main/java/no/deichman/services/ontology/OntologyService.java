package no.deichman.services.ontology;

import com.hp.hpl.jena.rdf.model.Model;

/**
 * Responsibility: Serve ontology model.
 */
public interface OntologyService {
    Model getOntology();
}
