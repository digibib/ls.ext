package no.deichman.services;

import java.io.StringWriter;
import java.io.UnsupportedEncodingException;

import org.apache.commons.io.output.ByteArrayOutputStream;
import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFDataMgr;

import com.hp.hpl.jena.query.Query;
import com.hp.hpl.jena.query.QueryFactory;
import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;
import com.hp.hpl.jena.rdf.model.Statement;
import com.hp.hpl.jena.update.UpdateAction;

public class SPARQLQueryBuilder {

    public Query dumpModel() {
    	String q = "describe * where {?s ?p ?o}";
    	return QueryFactory.create(q);
    }

	public Query getGetWorkByIdQuery(String id) {
        String queryString =
                "PREFIX dcterms: <http://purl.org/dc/terms/>\n"
                + "PREFIX deichman: <http://deichman.no/ontology#>\n"
                + "PREFIX foaf: <http://xmlns.com/foaf/0.1/>\n"
                + "DESCRIBE <" + id + ">";
        return QueryFactory.create(queryString);
    }

    public Query getListWorkQuery() {
        String queryString =
                "PREFIX deichman: <http://deichman.no/ontology#>\n"
                + "describe ?s where\n"
                + " {\n"
                + " ?s a deichman:Work"
                + "}";
        return QueryFactory.create(queryString);

    }

    public String getUpdateWorkQueryString(Model work) {
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

    private String renameWorkResource(String newURI) {
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

    public String getCreateWorkQueryString(String id, Model work) {

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

    public Query getItemsFromModelQuery(String id) {
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

    public Query checkIfResourceExists(String uri) {
        String q = "ASK {<" + uri + "> ?p ?o}";
        return QueryFactory.create(q);
    }

	public Query checkIfResourceExistsInGraph(String uri, String graph) {
        String q = "ASK {GRAPH <" + graph + ">  {<" + uri + "> ?p ?o}}";
        return QueryFactory.create(q);
	}

	public Query checkIfStatementExists(Statement statement) throws UnsupportedEncodingException {
        String triple = statementToN3(statement);
        String q = "ASK {" + triple + "}" ;
		return QueryFactory.create(q);
    }

    public Query checkIfStatementExistsInGraph(Statement statement, String graph) throws UnsupportedEncodingException {
        String triple = statementToN3(statement);
        String q = "ASK {GRAPH <" + graph + "> {" + triple + "}}" ;
		return QueryFactory.create(q);
    }

    private String statementToN3 (Statement statement) throws UnsupportedEncodingException {
        Model tempExists = ModelFactory.createDefaultModel();
        tempExists.add(statement);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        RDFDataMgr.write(baos, tempExists, Lang.NTRIPLES);
        return baos.toString("UTF-8");
    }

	public String updateAdd(Model inputModel) {
        StringWriter sw = new StringWriter();
        RDFDataMgr.write(sw, inputModel, Lang.NTRIPLES);
        String data = sw.toString();

        return "PREFIX deichman: <http://deichman.no/ontology#>\n"
                + "PREFIX dcterms: <http://purl.org/dc/terms/>\n"
                + "INSERT DATA {\n"
                + "\n"
                + data
                + "\n"
                + "}";
	}

	public String updateAddToGraph(Model inputModel, String graph) {
        StringWriter sw = new StringWriter();
        RDFDataMgr.write(sw, inputModel, Lang.NTRIPLES);
        String data = sw.toString();

        String q = "INSERT DATA {\n"
        		+ "GRAPH <" + graph + "> {\n"
                + "\n"
                + data
                + "\n"
                + "}\n"
                + "}";
       return q;
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

	public String updateDeleteFromGraph(Model inputModel, String graph) {
        StringWriter sw = new StringWriter();
        RDFDataMgr.write(sw, inputModel, Lang.NTRIPLES);
        String data = sw.toString();

        return "DELETE DATA { GRAPH <" + graph + "> {\n"
        + "\n"
        + data
        + "\n"
        + "}\n"
        + "}";
	}

	public String askIfGraphExists(String graph) {
        String q = "ASK {GRAPH <" + graph + "> {}}" ;
		return q;
	}

}
