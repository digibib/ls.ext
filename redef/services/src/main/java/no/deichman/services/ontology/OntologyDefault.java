package no.deichman.services.ontology;

import no.deichman.services.uridefaults.BaseURIDefault;
import org.apache.commons.io.IOUtils;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

public class OntologyDefault implements Ontology {
	
	private String ontology = null;
	
	public OntologyDefault() throws IOException {
		InputStream in = this.getClass().getClassLoader().getResourceAsStream("ontology.ttl");
		String turtle = IOUtils.toString(in);
		BaseURIDefault bud = new BaseURIDefault();
		ontology = turtle.replace("http://data.deichman.no/lsext-model#",bud.getOntologyURI());
	}
	
	public InputStream toInputStream() {
		return new ByteArrayInputStream(ontology.getBytes(StandardCharsets.UTF_8));     
	}
	
	public String toString() {
		return ontology;
	}

}
