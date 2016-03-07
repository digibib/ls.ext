package no.deichman.services.entity.repository;

import no.deichman.services.entity.patch.Patch;
import no.deichman.services.rdf.RDFModelUtil;
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
import java.util.List;
import java.util.stream.Collectors;

import static org.apache.commons.lang3.StringUtils.capitalize;

/**
 * Responsibility: TODO.
 */
public final class SPARQLQueryBuilder {
    public static final String INSERT = "INSERT";
    public static final String DELETE = "DELETE";
    public static final String NEWLINE = "\n";
    private static final String INDENT = "    ";

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

    public Query describeWorkAndLinkedResources(String workId) {
        String queryString = String.format("#\n"
                + "PREFIX deichman: <%1$s>\n"
                + "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n"
                + "DESCRIBE <%2$s> ?publication ?creator ?format ?label\n"
                + "WHERE {\n"
                + "    <%2$s> a deichman:Work .\n"
                + "    optional {\n"
                + "            <%2$s> deichman:mainTitle ?title \n"
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


    public Query describePersonAndLinkedResources(String personId) {
        String queryString = String.format("#\n"
                + "PREFIX deichman: <%1$s>\n"
                + "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n"
                + "DESCRIBE <%2$s> ?name ?birth ?death ?personTitle ?nationality ?nationalityLabel \n"
                + "WHERE {\n"
                + "    <%2$s> a deichman:Person .\n"
                + "    optional { <%2$s> deichman:name ?name . }\n"
                + "    optional { <%2$s> deichman:birthYear ?birth . }\n"
                + "    optional { <%2$s> deichman:deathYear ?death . }\n"
                + "    optional { <%2$s> deichman:personTitle ?personTitle . }\n"
                + "    optional { <%2$s> deichman:nationality ?nationality . \n"
                + "                 ?nationality rdfs:label ?nationalityLabel .\n"
                + "             }\n"
                + "}", baseURI.ontology(), personId);
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

        String del = getStringOfStatments(patches, "DEL");
        String delSelect = getStringOfStatementsWithVariables(patches, "DEL");
        String add = getStringOfStatments(patches, "ADD");

        if (del.length() > 0) {
            q.append(DELETE + " DATA {" + NEWLINE + del +  "}");
        }
        if (delSelect.length() > 0) {
            q.append(" WHERE {" + NEWLINE + delSelect + "}");
        }
        if (add.length() > 0 && del.length() > 0) {
            q.append(" ;\n");
        }
        if (add.length() > 0) {
            q.append(INSERT + " DATA {" + NEWLINE + add + "}");
        }

        return q.toString();
    }

    private String getStringOfStatementsWithVariables(List<Patch> patches, String operation) {

        String retVal = "";

        String bnodeSubjectCheck = patches.stream()
                .filter(s -> s.getStatement().getSubject().isAnon())
                .map(s -> {return "a"; })
                .collect(Collectors.joining(""));

        String bnodeObjectCheck = patches.stream()
                .filter(s -> s.getStatement().getObject().isAnon())
                .map(s -> {return "a"; })
                .collect(Collectors.joining());

        if (bnodeSubjectCheck.contains("a") && bnodeObjectCheck.contains("a")) {
            retVal = patches.stream()
                    .filter(patch -> patch.getOperation().toUpperCase().equals(operation.toUpperCase()))
                    .map(patch2 -> {
                                Model model = ModelFactory.createDefaultModel();
                                model.add(patch2.getStatement());
                                String withoutBnodes = RDFModelUtil.stringFrom(model, Lang.NTRIPLES).replaceAll("_:", "?");
                                return INDENT + withoutBnodes;
                            }
                    ).filter(s -> !s.isEmpty()).collect(Collectors.joining());

        }

        return retVal;
    }

    private String getStringOfStatments(List<Patch> patches, String operation) {
        return patches.stream()
                .filter(patch -> patch.getOperation().toUpperCase().equals(operation.toUpperCase()))
                .map(patch2 -> {
                    Model model = ModelFactory.createDefaultModel();
                    model.add(patch2.getStatement());
                    return INDENT + RDFModelUtil.stringFrom(model, Lang.NTRIPLES);
                }
        ).filter(s -> !s.isEmpty()).collect(Collectors.joining());

    }

    public Query getImportedResourceById(String id, String type) {
        String q = "SELECT ?uri "
                + "WHERE "
                + "  { ?uri <http://data.deichman.no/duo#bibliofil" + type + "Id> \"" + id + "\" }";
        return QueryFactory.create(q);
    }

    public Query getBibliofilPersonResource(String personId) {
        String q = "SELECT ?uri "
                + "WHERE "
                + "  { ?uri <http://data.deichman.no/duo#bibliofilPersonId> \"" + personId + "\" }";
        return QueryFactory.create(q);
    }

    public Query getBibliofilPlaceOfPublicationResource(String id) {
        String q = "SELECT ?uri "
                + "WHERE "
                + "  { ?uri <http://data.deichman.no/duo#bibliofilPlaceOfPublicationId> \"" + id + "\" }";
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

    public Query selectAllUrisOfType(String type) {
        String q = String.format(""
                + "PREFIX deichman: <%s>\n"
                + "SELECT ?uri WHERE \n"
                + "    {\n"
                + "        ?uri a deichman:%s .\n"
                + "    }", baseURI.ontology(), capitalize(type));
        return QueryFactory.create(q);
    }

    public Query getBibliofilPublisherResource(String id) {
        String q = "SELECT ?uri "
                + "WHERE "
                + "  { ?uri <http://data.deichman.no/duo#bibliofilPublisherId> \"" + id + "\" }";
        return QueryFactory.create(q);
    }
}
