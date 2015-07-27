package no.deichman.services.ontology;

/**
 * Responsibility: Serve ontology.
 */
public interface OntologyService {
    String getOntologyTurtle();

    String getOntologyJsonLD();
}
