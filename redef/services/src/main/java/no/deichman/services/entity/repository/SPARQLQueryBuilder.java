package no.deichman.services.entity.repository;

import no.deichman.services.entity.patch.Patch;
import no.deichman.services.uridefaults.BaseURI;
import org.apache.commons.io.output.ByteArrayOutputStream;
import org.apache.jena.query.Query;
import org.apache.jena.query.QueryFactory;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.rdf.model.Statement;
import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFDataMgr;

import java.io.StringWriter;
import java.io.UnsupportedEncodingException;
import java.util.Iterator;
import java.util.List;

/**
 * Responsibility: TODO.
 */
public final class SPARQLQueryBuilder {
    private final BaseURI baseURI;

    SPARQLQueryBuilder() {
        baseURI = BaseURI.remote();
    }

    public SPARQLQueryBuilder(BaseURI base) {
        baseURI = base;
    }

    public Query getGetResourceByIdQuery(String id) {
        String queryString = "DESCRIBE <" + id + ">";
        return QueryFactory.create(queryString);
    }

    public Query describeWorkAndLinkedPublication(String workId) {
        String queryString = String.format("#\n"
                + "PREFIX deichman: <%1$s>\n"
                + "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n"
                + "DESCRIBE <%2$s> ?publication ?creator ?format ?label\n"
                + "WHERE {\n"
                + "    <%2$s> a deichman:Work .\n"
                + "    optional {\n"
                + "            <%2$s> deichman:title ?title \n"
                + "    } \n"
                + "    optional { \n"
                + "           <%2$s> deichman:creator ?creator .\n"
                + "    }\n"
                + "    optional { \n"
                + "           ?publication deichman:publicationOf <%2$s> . \n"
                + "            optional { \n"
                + "                        ?publication deichman:format ?format .\n"
                + "                        ?format rdfs:label ?label .\n"
                + "            }\n"
                + "    }\n"
                + "}", baseURI.ontology(), workId);
        return QueryFactory.create(queryString);
    }

    public String getUpdateWorkQueryString(Model work) {
        return getCreateQueryString(work);
    }

    public String getReplaceSubjectQueryString(String newURI) {
        return "DELETE {\n"
                + " ?s ?p ?o .\n"
                + "}\n"
                + "INSERT {\n"
                + " <" + newURI + "> ?p ?o .\n"
                + "}\n"
                + "WHERE {\n"
                + " ?s ?p ?o .\n"
                + "}\n";
    }

    public String getCreateQueryString(Model work) {
        StringWriter sw = new StringWriter();
        RDFDataMgr.write(sw, work, Lang.NTRIPLES);
        String data = sw.toString();

        return "INSERT DATA {\n"
                + "\n"
                + data
                + "\n"
                + "}";
    }

    public Query getItemsFromModelQuery(String id) {
        String q = "PREFIX deichman: <" + baseURI.ontology() + ">\n"
                + "PREFIX duo: <http://data.deichman.no/utility#>\n"
                + "CONSTRUCT {\n"
                + "  ?uri deichman:editionOf  <" + id + "> ;"
                + "    a deichman:Item ;"
                + "    deichman:location ?location ;"
                + "    deichman:status ?status ;"
                + "    deichman:barcode ?barcode ;"
                + "    duo:shelfmark ?shelfmark ;"
                + "    duo:onloan ?onloan"
                + "} WHERE { \n"
                + "  ?uri a deichman:Item ;\n"
                + "    deichman:location ?location;\n"
                + "    deichman:status ?status ;"
                + "    deichman:barcode ?barcode ;\n"
                + "    duo:shelfmark ?shelfmark ;\n"
                + "    duo:onloan ?onloan ."
                + "}";
        return QueryFactory.create(q);
    }

    public Query checkIfResourceExists(String uri) {
        String q = "ASK {<" + uri + "> ?p ?o}";
        return QueryFactory.create(q);
    }

    public Query checkIfStatementExists(Statement statement) throws UnsupportedEncodingException {
        String triple = statementToN3(statement);
        String q = "ASK {" + triple + "}";
        return QueryFactory.create(q);
    }

    private String statementToN3(Statement statement) throws UnsupportedEncodingException {
        Model tempExists = ModelFactory.createDefaultModel();
        tempExists.add(statement);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        RDFDataMgr.write(baos, tempExists, Lang.NTRIPLES);
        return baos.toString("UTF-8");
    }

    public String updateDelete(Model inputModel) {
        StringWriter sw = new StringWriter();
        RDFDataMgr.write(sw, inputModel, Lang.NTRIPLES);
        String data = sw.toString();

        return "DELETE {\n"
                + data
                + "} WHERE {\n"
                + "\n"
                + data
                + "\n"
                + "}";
    }

    public String patch(List<Patch> patches) {
        StringBuilder q = new StringBuilder();
        Iterator<Patch> patchIterator = patches.iterator();
        while (patchIterator.hasNext()) {
            Patch currentPatch = patchIterator.next();
            String sep = " ;\n";
            String operation = null;
            if (!patchIterator.hasNext()) {
                sep = "";
            }
            switch (currentPatch.getOperation().toUpperCase()) {
                case "ADD":
                    operation = "INSERT";
                    break;
                case "DEL":
                    operation = "DELETE";
                    break;
                default:
                    throw new RuntimeException("Invalid patch operation");
            }

            Model temp = ModelFactory.createDefaultModel();
            temp.add(currentPatch.getStatement());
            StringWriter sw = new StringWriter();
            RDFDataMgr.write(sw, temp, Lang.NTRIPLES);
            String triple = sw.toString();
            String phrase = operation + " DATA {" + triple.trim() + "}" + sep;
            q.append(phrase);
        }
        return q.toString();
    }

    public Query getBibliofilPersonResource(String personId) {
        String q = "SELECT ?uri "
                + "WHERE "
                + "  { ?uri <http://data.deichman.no/duo#bibliofilPersonId> \"" + personId + "\" }";
        return QueryFactory.create(q);
    }

    public Query describeWorksByCreator(String uri) {
        String q = String.format(""
                + "PREFIX deichman: <%s>\n"
                + "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n"
                + "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>\n"
                + "PREFIX dcterms: <http://purl.org/dc/terms/>\n"
                + "DESCRIBE ?work \n"
                + "WHERE {\n"
                + "      ?work a deichman:Work ;\n"
                + "            deichman:creator <%s> .\n"
                + "}", baseURI.ontology(), uri);
        return QueryFactory.create(q);
    }

    public Query describeLinkedPublications(String uri) {
        String q = String.format(""
                + "PREFIX deichman: <%s>\n"
                + "DESCRIBE ?publication WHERE \n"
                + "    {\n"
                + "        ?publication deichman:publicationOf <%s>\n"
                + "    }", baseURI.ontology(), uri);
        return QueryFactory.create(q);
    }
}
