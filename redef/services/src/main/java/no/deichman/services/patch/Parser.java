package no.deichman.services.patch;

import org.apache.jena.iri.IRIException;
import org.apache.jena.iri.IRIFactory;


import no.deichman.services.error.PatchParserException;

public class Parser {
	
    private String input = null;
    private IRIFactory iriFactory = IRIFactory.semanticWebImplementation();

    Parser () {
    }

    public Parser(String input) {
        parse(input);
    }
    
    public void parse(String in) {
        setInput(in);
    }

    private void setInput(String in) {
        input = in;
    }

    public String getInput() {
        return input;
    }

    public boolean assessIRI(String input) throws PatchParserException {
        try {
            iriFactory.construct(input);
        } catch (IRIException e) {
            throw new PatchParserException("Bad IRI");
        }
        return true;
    }
}
