package no.deichman.services.entity.repository;

import no.deichman.services.entity.patch.Patch;
import no.deichman.services.rdf.RDFModelUtil;
import no.deichman.services.uridefaults.BaseURI;
import no.deichman.services.uridefaults.XURI;
import org.apache.commons.lang3.StringUtils;
import org.apache.jena.query.Query;
import org.apache.jena.query.QueryFactory;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.rdf.model.ResourceFactory;
import org.apache.jena.rdf.model.Statement;
import org.apache.jena.riot.Lang;
import org.apache.jena.update.UpdateAction;
import org.junit.Test;

import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

public class SPARQLQueryBuilderTest {

    private static Statement statement(String resource, String property, String literal) {
        return ResourceFactory.createStatement(
                ResourceFactory.createResource(resource),
                ResourceFactory.createProperty(property), ResourceFactory.createPlainLiteral(literal));
    }

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
        assertNotNull(new SPARQLQueryBuilder());
    }

    @Test
    public void get_resource_by_id(){
        SPARQLQueryBuilder sqb = new SPARQLQueryBuilder();
        Query query = sqb.getGetResourceByIdQuery("http://example.com/a");
        String expected = "DESCRIBE <http://example.com/a>";
        assertEquals(expected,query.toString().trim());
    }

    @Test
    public void update_work(){
        Model m = ModelFactory.createDefaultModel();
        Statement s = getTestStatement();
        m.add(s);
        SPARQLQueryBuilder sqb = new SPARQLQueryBuilder();
        String query = sqb.getUpdateWorkQueryString(m);
        String expected = "INSERT DATA {\n"
                + "\n"
                + "<http://example.com/a> <http://example.com/b> <http://example.com/c> .\n"
                + "\n"
                + "}";
        assertEquals(expected,query);
    }

    @Test
    public void test_it_replaces_subject_but_not_if_bnode() {
        SPARQLQueryBuilder sqb = new SPARQLQueryBuilder();
        String query = sqb.getReplaceSubjectQueryString("mylovelyuri");
        String expected = "DELETE {\n"
                + " ?s ?p ?o .\n"
                + "}\n"
                + "INSERT {\n"
                + " <mylovelyuri> ?p ?o .\n"
                + "}\n"
                + "WHERE {\n"
                + " ?s ?p ?o .\n"
                + " FILTER (!isBlank(?s))\n"
                + "}\n";
        assertEquals(expected,query);
    }

    @Test
    public void test_it_creates_work_query(){
        Model m = ModelFactory.createDefaultModel();
        Statement s = getTestStatement();
        m.add(s);
        String newSubject = "http://example.com/z";
        SPARQLQueryBuilder sqb = new SPARQLQueryBuilder();

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
        String test = "PREFIX  deichman: <" + BaseURI.ontology() + ">\n"
                + "PREFIX  duo:  <http://data.deichman.no/utility#>\n"
                + "\n"
                + "CONSTRUCT \n"
                + "  { \n"
                + "    ?uri deichman:editionOf <" + uri + "> .\n"
                + "    ?uri <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> deichman:Item .\n"
                + "    ?uri deichman:branch ?branch .\n"
                + "    ?uri deichman:location ?location .\n"
                + "    ?uri deichman:status ?status .\n"
                + "    ?uri deichman:barcode ?barcode .\n"
                + "    ?uri duo:shelfmark ?shelfmark .\n"
                + "  }\n"
                + "WHERE\n"
                + "  { ?uri  a                     deichman:Item ;\n"
                + "          deichman:branch       ?branch ;\n"
                + "          deichman:status       ?status ;\n"
                + "          deichman:barcode      ?barcode .\n"
                + " OPTIONAL { ?uri duo:shelfmark ?shelfmark }\n"
                + " OPTIONAL { ?uri deichman:location ?location}\n"
                + "  }\n";
        SPARQLQueryBuilder sqb = new SPARQLQueryBuilder();
        Query query = sqb.getItemsFromModelQuery(uri);
        Query expected = QueryFactory.create(test);
        assertEquals(expected,query);
    }

    @Test
    public void test_resource_existence_query() throws Exception {
        XURI uri = new XURI("http://deichman.no/work/w123");
        String test = "ASK {<" + uri.getUri() + "> ?p ?o}";
        Query expected = QueryFactory.create(test);
        SPARQLQueryBuilder sqb = new SPARQLQueryBuilder();
        assertEquals(expected, sqb.checkIfResourceExists(uri));
    }

    @Test
    public void test_statement_exists() throws UnsupportedEncodingException{
        Statement s = getTestStatement();
        SPARQLQueryBuilder sqb = new SPARQLQueryBuilder();
        String test = "ASK {<" + s.getSubject().getURI() + "> <" + s.getPredicate().getURI()  + "> <" + s.getObject().toString() + "> . }";
        Query expected = QueryFactory.create(test);
        assertEquals(expected, sqb.checkIfStatementExists(s));
    }

    @Test
    public void test_insert_patch() throws Exception{
        List<Patch> patches = new ArrayList<Patch>();
        Statement s = statement("http://example.com/a", "http://example.com/ontology/name", "json");
        Patch patch = new Patch("add", s, null);
        patches.add(patch);
        SPARQLQueryBuilder sqb = new SPARQLQueryBuilder();
        String expected = "INSERT DATA {\n"
                + "    <http://example.com/a> <http://example.com/ontology/name> \"json\" .\n"
                + "};\n";
        assertEquals(expected,sqb.patch(patches));
    }

    @Test
    public void test_delete_patch() throws Exception{
        List<Patch> patches = new ArrayList<Patch>();
        Statement s = statement("http://example.com/a", "http://example.com/ontology/name", "json");
        Patch patch = new Patch("del", s, null);
        patches.add(patch);
        SPARQLQueryBuilder sqb = new SPARQLQueryBuilder();
        String expected = "DELETE DATA {\n"
                + "    <http://example.com/a> <http://example.com/ontology/name> \"json\" .\n"
                + "};\n";
        assertEquals(expected,sqb.patch(patches));
    }

    @Test
    public void test_delete_insert_patch_combination_one() throws Exception{
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
        SPARQLQueryBuilder sqb = new SPARQLQueryBuilder();
        String expected = "DELETE DATA {\n"
                + "    <http://example.com/a> <http://example.com/ontology/name> \"json\" .\n"
                + "    <http://example.com/a> <http://example.com/ontology/test> \"json\" .\n"
                + "};\n"
                + "INSERT DATA {\n"
                + "    <http://example.com/a> <http://example.com/ontology/cress> \"false fish\" .\n"
                + "};\n";
        assertEquals(expected,sqb.patch(patches));
    }

    @Test
    public void test_delete_insert_patch_combination_two() {
        List<Patch> patches = new ArrayList<Patch>();
        Statement s0 = statement("http://example.com/a", "http://example.com/ontology/farmhouse", "Fiffle");
        Patch patch0 = new Patch("add", s0, null);
        patches.add(patch0);
        Statement s1 = statement("http://example.com/a", "http://example.com/ontology/name", "json");
        Patch patch1 = new Patch("del", s1, null);
        patches.add(patch1);
        Statement s2 = statement("http://example.com/a", "http://example.com/ontology/test", "json");
        Patch patch2 = new Patch("del", s2, null);
        patches.add(patch2);
        Statement s3 = statement("http://example.com/a", "http://example.com/ontology/cress", "false fish");
        Patch patch3 = new Patch("add", s3, null);
        patches.add(patch3);
        SPARQLQueryBuilder sqb = new SPARQLQueryBuilder();
        String expected = "DELETE DATA {\n"
                + "    <http://example.com/a> <http://example.com/ontology/name> \"json\" .\n"
                + "    <http://example.com/a> <http://example.com/ontology/test> \"json\" .\n"
                + "};\n"
                + "INSERT DATA {\n"
                + "    <http://example.com/a> <http://example.com/ontology/farmhouse> \"Fiffle\" .\n"
                + "    <http://example.com/a> <http://example.com/ontology/cress> \"false fish\" .\n"
                + "};\n";
        assertEquals(expected,sqb.patch(patches));
    }

    @Test
    public void test_bnode_insert_patch_one() {
        List<Patch> patches = new ArrayList<Patch>();
        Statement s0 = ResourceFactory.createStatement(
                ResourceFactory.createResource("http://example.org/a"),
                ResourceFactory.createProperty("http://example.org/prop#a"), ResourceFactory.createResource("_:b0"));
        Patch patch0 = new Patch("add", s0, null);
        patches.add(patch0);
        Statement s1 = statement("_:b0", "http://example.com/ontology/name", "json");
        Patch patch1 = new Patch("add", s1, null);
        patches.add(patch1);
        Statement s2 = statement("_:b0", "http://example.com/ontology/test", "json");
        Patch patch2 = new Patch("add", s2, null);
        patches.add(patch2);
        SPARQLQueryBuilder sqb = new SPARQLQueryBuilder();
        String expected = "INSERT DATA {\n"
                + "    <http://example.org/a> <http://example.org/prop#a> <_:b0> .\n"
                + "    <_:b0> <http://example.com/ontology/name> \"json\" .\n"
                + "    <_:b0> <http://example.com/ontology/test> \"json\" .\n"
                + "};\n";
        assertEquals(expected,sqb.patch(patches));
    }

    @Test
    public void test_bnode_insert_delete_patch_one() {

        String addData = "@prefix : <http://example.com/> .\n"
                + "\n"
                + ":a :b _:b0 ;\n"
                + "   :c \"A test\" .\n"
                + "\n"
                + "_:b0 :c \"another test\" .";

        String delData ="@prefix : <http://example.com/> .\n"
                + "\n"
                + ":a :b _:b0 ;\n"
                + "   :c \"A delete test\" .\n"
                + "\n"
                + "_:b0 :c \"another delete test\" .";

        List<Patch> patches = new ArrayList<Patch>();

        Model addModel = RDFModelUtil.modelFrom(addData, Lang.TURTLE);
        Model delModel = RDFModelUtil.modelFrom(delData, Lang.TURTLE);

        List<Statement> addStatements = addModel.listStatements().toList();
        addStatements.sort((o1, o2) -> sortableTag(o1).compareTo(sortableTag(o2)));
        List<Statement> delStatements = delModel.listStatements().toList();
        delStatements.sort((o1, o2) -> sortableTag(o1).compareTo(sortableTag(o2)));

        patches.addAll(addStatements.stream().map(s -> createPatch("add", s)).collect(Collectors.toList()));
        patches.addAll(delStatements.stream().map(s -> createPatch("del", s)).collect(Collectors.toList()));

        SPARQLQueryBuilder sqb = new SPARQLQueryBuilder();


        String actual = sqb.patch(patches).replaceAll("(\\?|_:)[A-Za-z0-9]+", "$1b0");
        assertEquals("DELETE DATA {\n"
                + "    <http://example.com/a> <http://example.com/c> \"A delete test\" .\n"
                + "};\n"
                + "DELETE {\n"
                + "    ?b0 <http://example.com/c> \"another delete test\" .\n"
                + "    <http://example.com/a> <http://example.com/b> ?b0 .\n"
                + "}\n"
                + "WHERE {\n"
                + "    ?b0 <http://example.com/c> \"another delete test\" .\n"
                + "    <http://example.com/a> <http://example.com/b> ?b0 .\n"
                + "};\n"
                + "INSERT DATA {\n"
                + "    _:b0 <http://example.com/c> \"another test\" .\n"
                + "    <http://example.com/a> <http://example.com/c> \"A test\" .\n"
                + "    <http://example.com/a> <http://example.com/b> _:b0 .\n"
                + "};\n", actual);
    }

    private String sortableTag(Statement o1) {
        return o1.getSubject().isAnon()? "_:b0" : o1.getSubject().getURI();
    }

    private Patch createPatch(String operation, Statement s) {

        Patch p = new Patch(operation, s, null);

        return p;
    }

/* Is this the role of this class?
    @Test(expected=Exception.class)
    public void test_invalid_patch_fails() throws Exception{
        List<Patch> patches = new ArrayList<Patch>();
        Statement s = statement("http://example.com/a", "http://example.com/ontology/" + "name", "json");
        Patch patch = new Patch("fail", s, null);
        patches.add(patch);
        SPARQLQueryBuilder sqb = new SPARQLQueryBuilder(BaseURI.local());
        sqb.patch(patches);
    }
*/
    @Test
    public void test_get_Bibliofil_person_resource() {
        String personId = "n12345";
        String expected = "SELECT  ?uri\n"
                + "WHERE\n"
                + "  { ?uri  <http://data.deichman.no/duo#bibliofilPersonId>  \"" + personId + "\" }\n";
        SPARQLQueryBuilder sqb = new SPARQLQueryBuilder();

        assertEquals("Bibliofil person resource query did not match", expected, sqb.getBibliofilPersonResource(personId).toString());
    }

    @Test
    public void test_get_bibliofil_place_resource() {
        String placeId = "n12345";
        String expected = "SELECT  ?uri\n"
                + "WHERE\n"
                + "  { ?uri  <http://data.deichman.no/duo#bibliofilPlaceId>  \"" + placeId + "\" }\n";
        SPARQLQueryBuilder sqb = new SPARQLQueryBuilder();
        assertEquals("Bibliofil place of publication resource query did not match", expected, sqb.getBibliofilPlaceResource(placeId).toString());
    }

    @Test
    public void test_describe_publications_query() throws Exception {
        XURI xuri = new XURI("http://deichman.no/work/w123123");
        String test = "PREFIX deichman: <" + BaseURI.ontology() + ">\n"
                + "DESCRIBE ?publication WHERE \n"
                + "    {\n"
                + "        ?publication deichman:publicationOf <"+ xuri.getUri() +">\n"
                + "    }";
        SPARQLQueryBuilder sqb = new SPARQLQueryBuilder();
        Query query = sqb.describeLinkedPublications(xuri);
        Query expected = QueryFactory.create(test);
        assertEquals(expected,query);
    }

    @Test
    public void test_update_branches_query() throws Exception {
        String recordId = "378";
        String homeBranches = "hutl,fmaj,fgry";
        String availableBranches = "fgry,fmaj";
        int numItems = 8;
        String expected = "PREFIX : <" + BaseURI.ontology() + ">\n"
                + "DELETE { ?pub :hasHomeBranch ?homeBranch ; :hasAvailableBranch ?availBranch ; :hasNumItems ?numItems }\n"
                + "INSERT { ?pub :hasHomeBranch \"" + StringUtils.join(homeBranches.split(","), "\",\"") + "\" .\n"
                + "?pub :hasAvailableBranch \"" + StringUtils.join(availableBranches.split(","), "\",\"") + "\" .\n"
                + "?pub :hasNumItems " + numItems + " }\n"
                + "WHERE  { ?pub :recordId \"" + recordId + "\" .\n"
                + "         OPTIONAL { ?pub :hasNumItems ?numItems }\n"
                + "         OPTIONAL { ?pub :hasHomeBranch ?homeBranch }\n"
                + "         OPTIONAL { ?pub :hasAvailableBranch ?availBranch }\n"
                + "}\n";
        SPARQLQueryBuilder sqb = new SPARQLQueryBuilder();
        String query = sqb.updateAvailabilityData(recordId, homeBranches, availableBranches, numItems);
        assertEquals(expected, query);
    }

    @Test
    public void test_retrieve_record_ids_by_work_query() throws Exception {
        XURI xuri = new XURI("http://data.deichman.no/work/w234123");
        SPARQLQueryBuilder sqb = new SPARQLQueryBuilder();
        Query query = sqb.getRecordIdsByWork(xuri);
        String expected = "SELECT  ?recordId\n"
                + "WHERE\n"
                + "  { ?p  <http://data.deichman.no/ontology#publicationOf>  <" + xuri.getUri() + "> ;\n"
                + "        <http://data.deichman.no/ontology#recordId>  ?recordId\n"
                + "  }\n";
        assertEquals(expected, query.toString());
    }
}
