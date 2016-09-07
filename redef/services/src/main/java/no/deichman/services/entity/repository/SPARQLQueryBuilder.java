package no.deichman.services.entity.repository;

import no.deichman.services.entity.patch.Patch;
import no.deichman.services.rdf.RDFModelUtil;
import no.deichman.services.uridefaults.BaseURI;
import no.deichman.services.uridefaults.XURI;
import org.apache.commons.io.output.ByteArrayOutputStream;
import org.apache.commons.lang.StringUtils;
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
    public static final boolean KEEP_BLANK_NODES = true;
    public static final boolean SKIP_BLANK_NODES = false;

    private final BaseURI baseURI;

    public SPARQLQueryBuilder() {
        baseURI = BaseURI.remote();
    }

    public SPARQLQueryBuilder(BaseURI base) {
        baseURI = base;
    }

    public Query getGetResourceByIdQuery(String id) {
        String queryString = "DESCRIBE <" + id + ">";
        return QueryFactory.create(queryString);
    }

    public Query describeWorkAndLinkedResources(XURI xuri) {
        String queryString = String.format("#\n"
                + "PREFIX deichman: <%1$s>\n"
                + "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n"
                + "DESCRIBE <%2$s> ?publication ?workContributor ?format ?label ?subject ?genre ?serial ?nation ?pubContrib ?publicationContributor ?place\n"
                + "WHERE {\n"
                + "    <%2$s> a deichman:Work .\n"
                + "    optional {\n"
                + "            <%2$s> deichman:mainTitle ?title \n"
                + "    } \n"
                + "    optional { \n"
                + "           <%2$s> deichman:contributor ?workContrib.\n"
                + "           ?workContrib a deichman:Contribution ;\n"
                + "                    deichman:agent ?workContributor ."
                + "           optional { ?workContributor deichman:nationality ?nation }"
                + "    }\n"
                + "    optional { \n"
                + "           ?publication deichman:publicationOf <%2$s> ; \n"
                + "                        a deichman:Publication . \n"
                + "            optional { \n"
                + "                        ?publication deichman:format ?format .\n"
                + "                        ?format rdfs:label ?label .\n"
                + "            }\n"
                + "            optional { \n"
                + "                ?publication deichman:contributor ?pubContrib.\n"
                + "                ?pubContrib a deichman:Contribution ;\n"
                + "                        deichman:agent ?publicationContributor ."
                + "            }\n"
                + "            optional { \n"
                + "                ?publication deichman:inSerial ?serialIssue.\n"
                + "                ?serialIssue deichman:serial ?serial  ."
                + "            }\n"
                + "            optional { ?publication deichman:hasPlaceOfPublication ?place }"
                + "    }\n"
                + "    optional { \n"
                + "           <%2$s> deichman:subject ?subject .\n"
                + "    }\n"
                + "    optional {\n"
                + "           <%2$s> deichman:genre ?genre .\n"
                + "    }\n"
                + "}", baseURI.ontology(), xuri.getUri());
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

    public Query describeCorporationAndLinkedResources(String corporationId) {
        String queryString = String.format("#\n"
                + "PREFIX deichman: <%1$s>\n"
                + "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n"
                + "DESCRIBE <%2$s> ?name ?nationality ?nationalityLabel \n"
                + "WHERE {\n"
                + "    <%2$s> a deichman:Corporation .\n"
                + "    optional { <%2$s> deichman:name ?name . }\n"
                + "    optional { <%2$s> deichman:nationality ?nationality . \n"
                + "                 ?nationality rdfs:label ?nationalityLabel .\n"
                + "             }\n"
                + "}", baseURI.ontology(), corporationId);
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
                + " FILTER (!isBlank(?s))\n"
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
                + "    deichman:branch ?branch ;"
                + "    deichman:location ?location ;"
                + "    deichman:status ?status ;"
                + "    deichman:barcode ?barcode ;"
                + "    duo:shelfmark ?shelfmark ."
                + "} WHERE { \n"
                + "  ?uri a deichman:Item ;\n"
                + "    deichman:branch ?branch ;\n"
                + "    deichman:status ?status ;"
                + "    deichman:barcode ?barcode .\n"
                + " OPTIONAL { ?uri duo:shelfmark ?shelfmark }\n"
                + " OPTIONAL { ?uri deichman:location ?location }\n"
                + "}";
        return QueryFactory.create(q);
    }

    public Query checkIfResourceExists(XURI xuri) {
        String q = "ASK {<" + xuri.getUri() + "> ?p ?o}";
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

    public String patch(List<Patch> patches) {
        StringBuilder q = new StringBuilder();

        String del = getStringOfStatments(patches, "DEL", SKIP_BLANK_NODES);
        String delSelect = getStringOfStatementsWithVariables(patches, "DEL");
        String add = getStringOfStatments(patches, "ADD", KEEP_BLANK_NODES);

        if (del.length() > 0) {
            q.append("DELETE DATA {" + NEWLINE + del + "};" + NEWLINE);
        }
        if (delSelect.length() > 0) {
            q.append("DELETE {" + NEWLINE + delSelect + "}" + NEWLINE + "WHERE {" + NEWLINE + delSelect + "};" + NEWLINE);
        }
        if (add.length() > 0) {
            q.append(INSERT + " DATA {" + NEWLINE + add + "};" + NEWLINE);
        }

        return q.toString();
    }

    private String getStringOfStatementsWithVariables(List<Patch> patches, String operation) {

        String retVal = "";

        String bnodeSubjectCheck = patches.stream()
                .filter(s -> s.getStatement().getSubject().isAnon())
                .map(s -> {
                    return "a";
                })
                .collect(Collectors.joining(""));

        String bnodeObjectCheck = patches.stream()
                .filter(s -> s.getStatement().getObject().isAnon())
                .map(s -> {
                    return "a";
                })
                .collect(Collectors.joining());

        if (bnodeSubjectCheck.contains("a") && bnodeObjectCheck.contains("a")) {
            retVal = patches.stream()
                    .filter(patch -> patch.getOperation().toUpperCase().equals(operation.toUpperCase())
                            && (patch.getStatement().getSubject().isAnon() || patch.getStatement().getObject().isAnon()))
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

    private String getStringOfStatments(List<Patch> patches, String operation, boolean keepBlankNodes) {
        return patches.stream()
                .filter(patch -> patch.getOperation().toUpperCase().equals(operation.toUpperCase())
                        && (keepBlankNodes || !patch.getStatement().getObject().isAnon() && !patch.getStatement().getSubject().isAnon()))
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

    public Query getBibliofilPlaceResource(String id) {
        String q = "SELECT ?uri "
                + "WHERE "
                + "  { ?uri <http://data.deichman.no/duo#bibliofilPlaceId> \"" + id + "\" }";
        return QueryFactory.create(q);
    }

    public Query describeWorksByCreator(XURI xuri) {
        String q = String.format(""
                + "PREFIX deichman: <%1$s>\n"
                + "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n"
                + "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>\n"
                + "PREFIX dcterms: <http://purl.org/dc/terms/>\n"
                + "DESCRIBE ?work <%2$s>\n"
                + "WHERE {\n"
                + "      ?work a deichman:Work ;\n"
                + "            deichman:contributor ?contrib .\n"
                + "      ?contrib deichman:agent <%2$s> .\n"
                + "}", baseURI.ontology(), xuri.getUri());
        return QueryFactory.create(q);
    }

    public Query describeLinkedPublications(XURI xuri) {
        String q = String.format(""
                + "PREFIX deichman: <%s>\n"
                + "DESCRIBE ?publication WHERE \n"
                + "    {\n"
                + "        ?publication deichman:publicationOf <%s>\n"
                + "    }", baseURI.ontology(), xuri.getUri());
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

    public String updateHoldingBranches(String recordId, String branches) {
        String q = String.format(""
                + "PREFIX : <%s>\n"
                + "DELETE { ?pub :hasHoldingBranch ?branch }\n"
                + "INSERT { ?pub :hasHoldingBranch \"%s\" . }\n"
                + "WHERE { ?pub :recordID \"%s\" OPTIONAL { ?pub :hasHoldingBranch ?branch } }\n",
                baseURI.ontology(), StringUtils.join(branches.split(","),"\",\""), recordId);
        return q;
    }

    public Query getWorkByRecordId(String recordId) {
        String q = String.format(""
                        + "PREFIX : <%s>\n"
                        + "SELECT ?work\n"
                        + "WHERE { ?pub :recordID \"%s\" .\n"
                        + "        ?pub :publicationOf ?work }\n",
                baseURI.ontology(), recordId);
        return QueryFactory.create(q);
    }


    public Query selectWorksByAgent(XURI agent) {
        String q = String.format(""
                + "PREFIX deichman: <%1$s>\n"
                + "SELECT ?work\n"
                + "WHERE {\n"
                + "  ?work a deichman:Work ;\n"
                + "    deichman:contributor ?contrib .\n"
                + "  ?contrib  deichman:agent <%2$s> .\n"
                + "}", baseURI.ontology(), agent.getUri());
        return QueryFactory.create(q);
    }

    public Query constructInformationForMARC(XURI publication) {
        String q = String.format(""
                + "PREFIX deichman: <%1$s>\n"
                + "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n"
                + "CONSTRUCT {\n"
                + "  ?pub deichman:mainTitle ?mainTitle ;\n"
                + "       deichman:partTitle ?partTitle ;\n"
                + "       deichman:subtitle ?subtitle ;\n"
                + "       deichman:partNumber ?partNumber ;\n"
                + "       deichman:isbn ?isbn ;\n"
                + "       deichman:publicationYear ?publicationYear ;\n"
                + "       deichman:publicationPlace ?placeLabel ;\n"
                + "       deichman:ageLimit ?ageLimit ;\n"
                + "       deichman:mainEntryPerson ?mainEntryPersonName ;\n"
                + "       deichman:mainEntryCorporation ?mainEntryCorporationName ;\n"
                + "       deichman:subject ?subjectLabel ;\n"
                + "       deichman:formatLabel ?formatLabel ;\n"
                + "       deichman:language ?language ;\n"
                + "       deichman:workType ?workType ;\n"
                + "       deichman:mediaType ?mediaTypeLabel ;\n"
                + "       deichman:literaryForm ?literaryForm ;\n"
                + "       deichman:literaryFormLabel ?literaryFormLabel ;\n"
                + "       deichman:genre ?genreLabel .\n"
                + "}\n"
                + "WHERE {\n"
                + "  BIND(<%2$s> AS ?pub)\n"
                + "  ?pub deichman:mainTitle ?mainTitle .\n"
                + "  OPTIONAL { ?pub deichman:subtitle ?subtitle }\n"
                + "  OPTIONAL { ?pub deichman:partTitle ?partTitle }\n"
                + "  OPTIONAL { ?pub deichman:partNumber ?partNumber }\n"
                + "  OPTIONAL { ?pub deichman:isbn ?isbn }\n"
                + "  OPTIONAL { ?pub deichman:publicationYear ?publicationYear }\n"
                + "  OPTIONAL { ?pub deichman:language ?language }\n"
                + "  OPTIONAL { ?pub deichman:ageLimit ?ageLimit }\n"
                + "  OPTIONAL { ?pub deichman:hasPlaceOfPublication ?place . ?place deichman:prefLabel ?placeLabel }\n"
                + "  OPTIONAL { ?pub deichman:hasMediaType ?mediaType .\n"
                + "     ?mediaType rdfs:label ?mediaTypeLabel .\n"
                + "     FILTER(lang(?mediaTypeLabel) = \"no\")\n"
                + "  }"
                + "\n"
                + "  OPTIONAL { ?pub deichman:format ?format .\n"
                + "     ?format rdfs:label ?formatLabel .\n"
                + "     FILTER(lang(?formatLabel) = \"no\")\n"
                + "  }"
                + "\n"
                + "  OPTIONAL { ?work a deichman:Work ;\n"
                + "     deichman:hasWorkType ?type .\n"
                + "     ?type rdfs:label ?workType .\n"
                + "     FILTER(lang(?workType) = \"no\")\n"
                + "  }\n"
                + "  OPTIONAL {\n"
                + "    ?work deichman:contributor ?contrib .\n"
                + "    ?contrib a deichman:MainEntry ;\n"
                + "      deichman:agent ?agent .\n"
                + "    OPTIONAL { ?agent a deichman:Person ; deichman:name ?mainEntryPersonName . }\n"
                + "    OPTIONAL { ?agent a deichman:Corporation ; deichman:name ?mainEntryCorponratioName . }\n"
                + "  }\n"
                + "  OPTIONAL {\n"
                + "    ?work deichman:subject ?subject .\n"
                + "    ?subject deichman:prefLabel ?subjectLabel .\n"
                + "  }\n"
                + "  OPTIONAL {\n"
                + "    ?work deichman:genre ?genre .\n"
                + "    ?genre deichman:prefLabel ?genreLabel .\n"
                + "  }\n"
                + "  OPTIONAL { ?work deichman:literaryForm ?literaryForm .\n"
                + "    ?literaryForm rdfs:label ?literaryFormLabel .\n"
                + "    FILTER(lang(?literaryFormLabel) = \"no\")\n"
                + "  }"
                + "}", baseURI.ontology(), publication.getUri());
        return QueryFactory.create(q);
    }
}
