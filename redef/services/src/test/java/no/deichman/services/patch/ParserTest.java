package no.deichman.services.patch;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import org.junit.Test;

import no.deichman.services.error.PatchParserException;

public class ParserTest {

    @Test
    public void test_parser_object(){
        Parser p = new Parser();
        assertNotNull(p);
    }

    @Test
    public void test_parser_can_get_set_input(){
        String input = "asd";
        Parser p = new Parser(input);
        assertEquals(input,p.getInput());
    }

    @Test
    public void test_parser_accepts_valid_iris() throws PatchParserException{
       String http = "http://www.example.com/a";
       String https = "https://www.example.com/a";
       String ftp = "ftp://www.example.com/a";
       Parser p = new Parser(http);
       assertTrue(p.assessIRI(http));
       assertTrue(p.assessIRI(https));
       assertTrue(p.assessIRI(ftp));
    }

    @Test
    public void test_parser_does_not_accept_invalid_iris() throws PatchParserException {
        String badURI = "a://casasd";
        Parser p = new Parser();
        try {
            p.assessIRI(badURI);
            fail("Bad IRI");
        } catch (PatchParserException e) {
            assertEquals("Bad IRI",e.getMessage());
        }
    }
}
