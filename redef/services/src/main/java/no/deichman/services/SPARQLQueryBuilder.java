package no.deichman.services;

import java.io.StringWriter;

import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFDataMgr;

import com.hp.hpl.jena.query.Query;
import com.hp.hpl.jena.query.QueryFactory;
import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.update.UpdateAction;

public class SPARQLQueryBuilder {

    public static Query getGetWorkByIdQuery(String id) {
        String queryString =
                "PREFIX dcterms: <http://purl.org/dc/terms/>\n"
                + "PREFIX deichman: <http://deichman.no/ontology#>\n"
                + "PREFIX foaf: <http://xmlns.com/foaf/0.1/>\n"
                + "DESCRIBE <" + id + ">";
        return QueryFactory.create(queryString);
    }

    public static Query getListWorkQuery() {
        String queryString =
                "PREFIX deichman: <http://deichman.no/ontology#>\n"
                + "describe ?s where\n"
                + " {\n"
                + " ?s a deichman:Work"
                + "}";
        return QueryFactory.create(queryString);

    }

    public static String getUpdateWorkQueryString(Model work) {
        StringWriter sw = new StringWriter();
        RDFDataMgr.write(sw, work, Lang.NTRIPLES);
        String data = sw.toString();
        return "PREFIX deichman: <http://deichman.no/ontology#>\n"
                + "PREFIX dcterms: <http://purl.org/dc/terms/>\n"
                + "INSERT DATA {\n"
                + "\n"
                + data
                + "\n"
                + "}";
    }

    private static String renameWorkResource(String newURI) {
        return "PREFIX deichman: <http://deichman.no/ontology#>\n"
                + "DELETE {\n"
                + " ?s ?p ?o .\n"
                + "}\n"
                + "INSERT {\n"
                + " <" + newURI + "> ?p ?o .\n"
                + "}\n"
                + "WHERE {\n"
                + " ?s ?p ?o .\n"
                + "}\n";
    }

    public static String getCreateWorkQueryString(String id, Model work) {

        UpdateAction.parseExecute(renameWorkResource(id), work);
        StringWriter sw = new StringWriter();
        RDFDataMgr.write(sw, work, Lang.NTRIPLES);
        String data = sw.toString();

        return "PREFIX deichman: <http://deichman.no/ontology#>\n"
                + "PREFIX dcterms: <http://purl.org/dc/terms/>\n"
                + "INSERT DATA {\n"
                + "\n"
                + data
                + "\n"
                + "}";
    }

    public static Query getItemsFromModelQuery(String id) {
        String q = "PREFIX deichman: <http://deichman.no/ontology#>\n"
                + "PREFIX d: <http://purl.org/deichman/>\n"
                + "PREFIX frbr: <http://purl.org/vocab/frbr/core#>\n"
                + "CONSTRUCT {\n"
                + "  <" + id + "> deichman:hasEdition"
                + "( ["
                + "    a deichman:Item ;"
                + "    deichman:location ?location ;"
                + "    deichman:status ?status"
                + "  ])"
                + "} WHERE { \n"
                + "  ?uri a frbr:Item ;\n"
                + "    d:location ?location;\n"
                + "    d:status ?status .\n"
                + "}";
       return QueryFactory.create(q);
    }

    public static Query checkIfResourceExists(String uri) {
        String q = "ASK {<" + uri + "> ?p ?o}";
        return QueryFactory.create(q);
    }
}
