package no.deichman.services.ontology;

import java.io.InputStream;

public interface Ontology {
	String ontology = null;
	public String toString();
	public InputStream toInputStream();
}
