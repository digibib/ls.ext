package no.deichman.services.ontology;

import org.apache.jena.rdf.model.Model;

/**
 * Responsibility: Serve ontology model.
 */
interface OntologyService {
    Model getOntology();
}
