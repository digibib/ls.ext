package no.deichman.services.repository;

import java.io.StringWriter;

import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFDataMgr;

import com.hp.hpl.jena.query.Query;
import com.hp.hpl.jena.query.QueryFactory;
import com.hp.hpl.jena.rdf.model.Model;

class QueryBuilder {

    public static Query getGetWorkByIdQuery(String id) {
        String queryString =
                "PREFIX dcterms: <http://purl.org/dc/terms/>\n"
                + "PREFIX deichman: <http://deichman.no/ontology#>\n"
                + "PREFIX foaf: <http://xmlns.com/foaf/0.1/>\n"
                + "CONSTRUCT {\n"
                + "?url a deichman:Work ;\n"
                + "     dcterms:identifier ?id ;\n"
                + "     dcterms:creator ?creator ;\n"
                + "     dcterms:date ?date ;\n"
                + "     dcterms:title ?title ;\n"
                + "     deichman:hasEdition ?edition .\n"
                + "} WHERE {\n"
                + "?url a deichman:Work ;\n"
                + "     dcterms:identifier \"" + id + "\" .\n"
                + "OPTIONAL {?url dcterms:creator ?c .\n"
                + "?c foaf:name ?creator .}\n"
                + "OPTIONAL {?url dcterms:title ?t}\n"
                + "OPTIONAL {?url dcterms:date ?d}\n"
                + "OPTIONAL {?url deichman:hasEdition ?edition}\n"
                + "BIND (str(?d) as ?date)\n"
                + "BIND (str(?t) as ?title)\n"
                + "}";
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

    public static String getCreateWorkQueryString(Model work) {
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
}
