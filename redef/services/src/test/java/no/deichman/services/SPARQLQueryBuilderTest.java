package no.deichman.services;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.List;

import org.junit.Test;

import com.hp.hpl.jena.query.Query;
import com.hp.hpl.jena.query.QueryFactory;
import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;
import com.hp.hpl.jena.rdf.model.ResourceFactory;
import com.hp.hpl.jena.rdf.model.Statement;

import no.deichman.services.patch.Patch;
import no.deichman.services.uridefaults.BaseURIMock;

public class SPARQLQueryBuilderTest {

    private BaseURIMock baseURI = new BaseURIMock();

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
        assertNotNull(new SPARQLQueryBuilder(new BaseURIMock()));
    }

    @Test
    public void test_dump_model(){
        Model m = ModelFactory.createDefaultModel();
        Statement s = getTestStatement();
        m.add(s);
        SPARQLQueryBuilder sqb = new SPARQLQueryBuilder(new BaseURIMock());
        Query q = sqb.dumpModel();
        String expected = "DESCRIBE *\nWHERE\n  { ?s ?p ?o}";
        assertEquals(expected,q.toString().trim());
    }

    @Test 
    public void get_work_by_id(){
        Model m = ModelFactory.createDefaultModel();
        Statement s = getTestStatement();
        m.add(s);
        SPARQLQueryBuilder sqb = new SPARQLQueryBuilder(new BaseURIMock());
        Query query = sqb.getGetWorkByIdQuery("http://example.com/a");
        String expected = "DESCRIBE <http://example.com/a>";
        assertEquals(expected,query.toString().trim());
    }

    @Test
    public void update_work(){
        Model m = ModelFactory.createDefaultModel();
        Statement s = getTestStatement();
        m.add(s);
        SPARQLQueryBuilder sqb = new SPARQLQueryBuilder(new BaseURIMock());
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
        SPARQLQueryBuilder sqb = new SPARQLQueryBuilder(new BaseURIMock());
        String query = sqb.getCreateQueryString(newSubject, m);
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
        String test = "PREFIX deichman: <" + baseURI.getOntologyURI() + ">\n"
                + "CONSTRUCT {\n"
                + "  <" + uri + "> deichman:hasEdition"
                + "( ["
                + "    a deichman:Item ;"
                + "    deichman:location ?location ;"
                + "    deichman:status ?status"
                + "  ])"
                + "} WHERE { \n"
                + "  ?uri a deichman:Item ;\n"
                + "    deichman:location ?location;\n"
                + "    deichman:status ?status .\n"
                + "}";
        SPARQLQueryBuilder sqb = new SPARQLQueryBuilder(new BaseURIMock());
        Query query = sqb.getItemsFromModelQuery(uri);
        Query expected = QueryFactory.create(test);
        assertEquals(expected,query);
    }

    @Test
    public void test_resource_existence_query(){
        String uri = "http://example.com/a";
        String test = "ASK {<" + uri + "> ?p ?o}";
        Query expected = QueryFactory.create(test);
        SPARQLQueryBuilder sqb = new SPARQLQueryBuilder(new BaseURIMock());
        assertEquals(expected,sqb.checkIfResourceExists(uri));
    }

    @Test
    public void test_resource_existence_in_graph_query(){
        String graph = "http://example.com/g";
        String uri = "http://example.com/a";
        String test = "ASK {GRAPH <" + graph + "> {<" + uri + "> ?p ?o}}";
        Query expected = QueryFactory.create(test);
        SPARQLQueryBuilder sqb = new SPARQLQueryBuilder(new BaseURIMock());
        assertEquals(expected,sqb.checkIfResourceExistsInGraph(uri, graph));
    }

    @Test
    public void test_statement_exists() throws UnsupportedEncodingException{
        Statement s = getTestStatement();
        SPARQLQueryBuilder sqb = new SPARQLQueryBuilder(new BaseURIMock());
        String test = "ASK {<" + s.getSubject().getURI() + "> <" + s.getPredicate().getURI()  + "> <" + s.getObject().toString() + "> . }";
        Query expected = QueryFactory.create(test);
        assertEquals(expected,sqb.checkIfStatementExists(s));
    }

    @Test
    public void test_statement_exists_in_graph() throws UnsupportedEncodingException{
        Statement s = getTestStatement();
        String graph = "http://example.com/g";
        SPARQLQueryBuilder sqb = new SPARQLQueryBuilder(new BaseURIMock());
        String test = "ASK { GRAPH <" + graph  + "> {<" + s.getSubject().getURI() + "> <" + s.getPredicate().getURI()  + "> <" + s.getObject().toString() + "> . }}";
        Query expected = QueryFactory.create(test);
        assertEquals(expected,sqb.checkIfStatementExistsInGraph(s, graph));
    }

    @Test
    public void test_update_add(){
        Statement s = getTestStatement();
        SPARQLQueryBuilder sqb = new SPARQLQueryBuilder(new BaseURIMock());
        Model m = ModelFactory.createDefaultModel();
        m.add(s);
        String expected = "INSERT DATA {\n\n<" + s.getSubject().getURI() + "> <" + s.getPredicate().getURI()  + "> <" + s.getObject().toString() + "> .\n\n}";
        assertEquals(expected,sqb.updateAdd(m));
    }

    @Test
    public void test_update_add_to_graph(){
        Statement s = getTestStatement();
        String graph = "http://example.com/g";
        SPARQLQueryBuilder sqb = new SPARQLQueryBuilder(new BaseURIMock());
        Model m = ModelFactory.createDefaultModel();
        m.add(s);
        String triple = "<" + s.getSubject().getURI() + "> <" + s.getPredicate().getURI()  + "> <" + s.getObject().toString() + "> .";
        String expected = "INSERT DATA {\n"
                + "GRAPH <" + graph + "> {\n"
                + "\n"
                + triple
                + "\n\n"
                + "}\n"
                + "}";
        assertEquals(expected,sqb.updateAddToGraph(m, graph));
    }

    @Test
    public void test_update_delete(){
        Statement s = getTestStatement();
        SPARQLQueryBuilder sqb = new SPARQLQueryBuilder(new BaseURIMock());
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
    public void test_update_delete_from_graph(){
        Statement s = getTestStatement();
        String graph = "http://example.com/g";
        SPARQLQueryBuilder sqb = new SPARQLQueryBuilder(new BaseURIMock());
        Model m = ModelFactory.createDefaultModel();
        m.add(s);
        String triple = "<" + s.getSubject().getURI() + "> <" + s.getPredicate().getURI()  + "> <" + s.getObject().toString() + "> .";
        String expected = "DELETE DATA { GRAPH <" + graph + "> {\n"
                + "\n"
                + triple
                + "\n\n"
                + "}\n"
                + "}";
        assertEquals(expected,sqb.updateDeleteFromGraph(m, graph));
    }

    @Test
    public void test_ask_if_graph_exists(){
        String graph = "http://example.com/g";
        SPARQLQueryBuilder sqb = new SPARQLQueryBuilder(new BaseURIMock());
        String expected = "ASK {GRAPH <" + graph + "> {}}" ;
        assertEquals(expected,sqb.askIfGraphExists(graph));
    }

    @Test
    public void test_insert_patch() throws Exception{
        List<Patch> patches = new ArrayList<Patch>();
        Statement s = ResourceFactory.createStatement(
                ResourceFactory.createResource("http://example.com/a"),
                ResourceFactory.createProperty("http://example.com/ontology/name"), ResourceFactory.createPlainLiteral("json"));
        Patch patch = new Patch("add", s, null);
        patches.add(patch);
        SPARQLQueryBuilder sqb = new SPARQLQueryBuilder(new BaseURIMock());
        String expected = "INSERT DATA {<http://example.com/a> <http://example.com/ontology/name> \"json\" .}";
        assertEquals(expected,sqb.patch(patches));
    }

    @Test
    public void test_delete_patch() throws Exception{
        List<Patch> patches = new ArrayList<Patch>();
        Statement s = ResourceFactory.createStatement(
                ResourceFactory.createResource("http://example.com/a"),
                ResourceFactory.createProperty("http://example.com/ontology/name"), ResourceFactory.createPlainLiteral("json"));
        Patch patch = new Patch("del", s, null);
        patches.add(patch);
        SPARQLQueryBuilder sqb = new SPARQLQueryBuilder(new BaseURIMock());
        String expected = "DELETE DATA {<http://example.com/a> <http://example.com/ontology/name> \"json\" .}";
        assertEquals(expected,sqb.patch(patches));
    }

    @Test
    public void test_delete_add_multi_patch() throws Exception{
        List<Patch> patches = new ArrayList<Patch>();
        Statement s1 = ResourceFactory.createStatement(
                ResourceFactory.createResource("http://example.com/a"),
                ResourceFactory.createProperty("http://example.com/ontology/name"), ResourceFactory.createPlainLiteral("json"));
        Patch patch1 = new Patch("del", s1, null);
        patches.add(patch1);
        Statement s2 = ResourceFactory.createStatement(
                ResourceFactory.createResource("http://example.com/a"),
                ResourceFactory.createProperty("http://example.com/ontology/test"), ResourceFactory.createPlainLiteral("json"));
        Patch patch2 = new Patch("del", s2, null);
        patches.add(patch2);
        Statement s3 = ResourceFactory.createStatement(
                ResourceFactory.createResource("http://example.com/a"),
                ResourceFactory.createProperty("http://example.com/ontology/cress"), ResourceFactory.createPlainLiteral("false fish"));
        Patch patch3 = new Patch("add", s3, null);
        patches.add(patch3);
        SPARQLQueryBuilder sqb = new SPARQLQueryBuilder(new BaseURIMock());
        String expected = "DELETE DATA {<http://example.com/a> <http://example.com/ontology/name> \"json\" .} ;\n"
                        + "DELETE DATA {<http://example.com/a> <http://example.com/ontology/test> \"json\" .} ;\n"
                        + "INSERT DATA {<http://example.com/a> <http://example.com/ontology/cress> \"false fish\" .}";

        assertEquals(expected,sqb.patch(patches));
    }

    @Test(expected=Exception.class)
    public void test_invalid_patch_fails() throws Exception{
        List<Patch> patches = new ArrayList<Patch>();
        Statement s = ResourceFactory.createStatement(
                ResourceFactory.createResource("http://example.com/a"),
                ResourceFactory.createProperty("http://example.com/ontology/name"), ResourceFactory.createPlainLiteral("json"));
        Patch patch = new Patch("fail", s, null);
        patches.add(patch);
        SPARQLQueryBuilder sqb = new SPARQLQueryBuilder(new BaseURIMock());
        sqb.patch(patches);
    }
}
