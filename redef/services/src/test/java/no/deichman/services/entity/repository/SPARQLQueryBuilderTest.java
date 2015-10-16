package no.deichman.services.entity.repository;

import no.deichman.services.entity.patch.Patch;
import no.deichman.services.uridefaults.BaseURI;
import org.apache.jena.query.Query;
import org.apache.jena.query.QueryFactory;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.rdf.model.ResourceFactory;
import org.apache.jena.rdf.model.Statement;
import org.apache.jena.update.UpdateAction;
import org.junit.Test;

import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.List;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

public class SPARQLQueryBuilderTest {

    private BaseURI baseURI = BaseURI.local();

    private Statement getTestStatement(){
        return ResourceFactory.createStatement(
                ResourceFactory.createResource("http://example.com/a"),
                ResourceFactory.createProperty("http://example.com/b"),
                ResourceFactory.createResource("http://example.com/c"));
    }

    @Test
    public void basic_constructor_exists(){
        assertNotNull(new SPARQLQueryBuilder());
    }

    @Test
    public void overloaded_constructor_exists(){
        assertNotNull(new SPARQLQueryBuilder(BaseURI.local()));
    }

    @Test
    public void get_resource_by_id(){
        SPARQLQueryBuilder sqb = new SPARQLQueryBuilder(BaseURI.local());
        Query query = sqb.getGetResourceByIdQuery("http://example.com/a");
        String expected = "DESCRIBE <http://example.com/a>";
        assertEquals(expected,query.toString().trim());
    }

    @Test
    public void update_work(){
        Model m = ModelFactory.createDefaultModel();
        Statement s = getTestStatement();
        m.add(s);
        SPARQLQueryBuilder sqb = new SPARQLQueryBuilder(BaseURI.local());
        String query = sqb.getUpdateWorkQueryString(m);
        String expected = "INSERT DATA {\n"
                + "\n"
                + "<http://example.com/a> <http://example.com/b> <http://example.com/c> .\n"
                + "\n"
                + "}";
        assertEquals(expected,query);
    }

    @Test
    public void test_it_creates_work_query(){
        Model m = ModelFactory.createDefaultModel();
        Statement s = getTestStatement();
        m.add(s);
        String newSubject = "http://example.com/z";
        SPARQLQueryBuilder sqb = new SPARQLQueryBuilder(BaseURI.local());

        UpdateAction.parseExecute(sqb.getReplaceSubjectQueryString(newSubject), m);
        String query = sqb.getCreateQueryString(m);
        String expected = "INSERT DATA {\n"
                           + "\n"
                           + "<http://example.com/z> <http://example.com/b> <http://example.com/c> .\n"
                           + "\n"
                           + "}";
        assertEquals(expected,query);
    }

    @Test
    public void test_get_items_query(){
        String uri = "http://example.com/a";
        String test = "PREFIX deichman: <" + baseURI.ontology() + ">\n"
                + "PREFIX duo: <http://data.deichman.no/utility#>\n"
                + "CONSTRUCT {\n"
                + "  <" + uri + "> deichman:hasEdition"
                + " ["
                + "    a deichman:Item ;"
                + "    deichman:location ?location ;"
                + "    deichman:status ?status ;"
                + "    deichman:barcode ?barcode ;"
                + "    duo:shelfmark ?shelfmark ;"
                + "    duo:onloan ?onloan"
                + "  ]"
                + "} WHERE { \n"
                + "  ?uri a deichman:Item ;\n"
                + "    deichman:location ?location;\n"
                + "    deichman:status ?status ;"
                + "    deichman:barcode ?barcode ;\n"
                + "    duo:shelfmark ?shelfmark ;\n"
                + "    duo:onloan ?onloan .\n"
                + "}";
        SPARQLQueryBuilder sqb = new SPARQLQueryBuilder(BaseURI.local());
        Query query = sqb.getItemsFromModelQuery(uri);
        Query expected = QueryFactory.create(test);
        assertEquals(expected,query);
    }

    @Test
    public void test_resource_existence_query(){
        String uri = "http://example.com/a";
        String test = "ASK {<" + uri + "> ?p ?o}";
        Query expected = QueryFactory.create(test);
        SPARQLQueryBuilder sqb = new SPARQLQueryBuilder(BaseURI.local());
        assertEquals(expected,sqb.checkIfResourceExists(uri));
    }

    @Test
    public void test_statement_exists() throws UnsupportedEncodingException{
        Statement s = getTestStatement();
        SPARQLQueryBuilder sqb = new SPARQLQueryBuilder(BaseURI.local());
        String test = "ASK {<" + s.getSubject().getURI() + "> <" + s.getPredicate().getURI()  + "> <" + s.getObject().toString() + "> . }";
        Query expected = QueryFactory.create(test);
        assertEquals(expected,sqb.checkIfStatementExists(s));
    }

    @Test
    public void test_update_delete(){
        Statement s = getTestStatement();
        SPARQLQueryBuilder sqb = new SPARQLQueryBuilder(BaseURI.local());
        Model m = ModelFactory.createDefaultModel();
        m.add(s);
        String triple = "<" + s.getSubject().getURI() + "> <" + s.getPredicate().getURI()  + "> <" + s.getObject().toString() + "> .";
        String expected = "DELETE {\n"
                + triple + "\n"
                + "} WHERE {\n"
                + "\n"
                + triple
                + "\n\n"
                + "}";
        assertEquals(expected,sqb.updateDelete(m));
    }

    @Test
    public void test_insert_patch() throws Exception{
        List<Patch> patches = new ArrayList<Patch>();
        Statement s = statement("http://example.com/a", "http://example.com/ontology/name", "json");
        Patch patch = new Patch("add", s, null);
        patches.add(patch);
        SPARQLQueryBuilder sqb = new SPARQLQueryBuilder(BaseURI.local());
        String expected = "INSERT DATA {<http://example.com/a> <http://example.com/ontology/name> \"json\" .}";
        assertEquals(expected,sqb.patch(patches));
    }

    @Test
    public void test_delete_patch() throws Exception{
        List<Patch> patches = new ArrayList<Patch>();
        Statement s = statement("http://example.com/a", "http://example.com/ontology/name", "json");
        Patch patch = new Patch("del", s, null);
        patches.add(patch);
        SPARQLQueryBuilder sqb = new SPARQLQueryBuilder(BaseURI.local());
        String expected = "DELETE DATA {<http://example.com/a> <http://example.com/ontology/name> \"json\" .}";
        assertEquals(expected,sqb.patch(patches));
    }

    @Test
    public void test_delete_add_multi_patch() throws Exception{
        List<Patch> patches = new ArrayList<Patch>();
        Statement s1 = statement("http://example.com/a", "http://example.com/ontology/name", "json");
        Patch patch1 = new Patch("del", s1, null);
        patches.add(patch1);
        Statement s2 = statement("http://example.com/a", "http://example.com/ontology/test", "json");
        Patch patch2 = new Patch("del", s2, null);
        patches.add(patch2);
        Statement s3 = statement("http://example.com/a", "http://example.com/ontology/cress", "false fish");
        Patch patch3 = new Patch("add", s3, null);
        patches.add(patch3);
        SPARQLQueryBuilder sqb = new SPARQLQueryBuilder(BaseURI.local());
        String expected = "DELETE DATA {<http://example.com/a> <http://example.com/ontology/name> \"json\" .} ;\n"
                        + "DELETE DATA {<http://example.com/a> <http://example.com/ontology/test> \"json\" .} ;\n"
                        + "INSERT DATA {<http://example.com/a> <http://example.com/ontology/cress> \"false fish\" .}";

        assertEquals(expected,sqb.patch(patches));
    }

    private static Statement statement(String resource, String property, String literal) {
        return ResourceFactory.createStatement(
                ResourceFactory.createResource(resource),
                ResourceFactory.createProperty(property), ResourceFactory.createPlainLiteral(literal));
    }

    @Test(expected=Exception.class)
    public void test_invalid_patch_fails() throws Exception{
        List<Patch> patches = new ArrayList<Patch>();
        Statement s = statement("http://example.com/a", "http://example.com/ontology/" + "name", "json");
        Patch patch = new Patch("fail", s, null);
        patches.add(patch);
        SPARQLQueryBuilder sqb = new SPARQLQueryBuilder(BaseURI.local());
        sqb.patch(patches);
    }
}
