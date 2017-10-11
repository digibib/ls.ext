package no.deichman.services.entity.repository;

import com.google.common.collect.ImmutableMap;
import no.deichman.services.entity.EntityType;
import no.deichman.services.entity.patch.Patch;
import no.deichman.services.rdf.RDFModelUtil;
import no.deichman.services.uridefaults.BaseURI;
import no.deichman.services.uridefaults.XURI;
import org.apache.commons.io.output.ByteArrayOutputStream;
import org.apache.commons.lang3.StringUtils;
import org.apache.jena.query.Query;
import org.apache.jena.query.QueryFactory;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdf.model.Statement;
import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFDataMgr;

import java.io.StringWriter;
import java.io.UnsupportedEncodingException;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

import static com.google.common.collect.Lists.newArrayList;
import static java.lang.String.format;
import static java.util.stream.Collectors.joining;
import static java.util.stream.Stream.concat;
import static java.util.stream.Stream.of;
import static org.apache.commons.lang3.StringUtils.capitalize;
import static org.apache.jena.rdf.model.ResourceFactory.createTypedLiteral;

/**
 * Responsibility: Formulate SPARQL queries.
 */
public final class SPARQLQueryBuilder {

    public static final String INSERT = "INSERT";
    public static final String DELETE = "DELETE";
    public static final String NEWLINE = "\n";
    private static final String INDENT = "    ";
    public static final boolean KEEP_BLANK_NODES = true;
    public static final boolean SKIP_BLANK_NODES = false;
    public static final String STARTSWITH_NINE_SEVEN_EIGHT = "^978";
    public static final String VALID_ISBN_CHARS = "[^0-9Xx]";

    public SPARQLQueryBuilder() {
    }

    public Query getGetResourceByIdQuery(String id) {
        String queryString = "DESCRIBE <" + id + ">";
        return QueryFactory.create(queryString);
    }

    public Query describeWorkAndLinkedResources(XURI xuri) {
        String queryString = "#\n"
                + "PREFIX deichman: <http://data.deichman.no/ontology#>\n"
                + "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n"
                + "DESCRIBE <__WORKURI__> ?publication ?workContributor ?compType ?format ?mediaType ?subject\n"
                + "         ?genre ?instrument ?publicationPart ?litform ?hasWorkType ?serial ?nation\n"
                + "         ?pubContrib ?publicationContributor ?place ?publishedBy ?publicationPartValues\n"
                + "         ?bio ?country ?contentAdaptation ?relatedWork ?workSeries ?workAsSubjectAgent ?relworkMainEntry\n"
                + "WHERE {\n"
                + "        { <__WORKURI__> a deichman:Work }\n"
                + "  UNION { <__WORKURI__> deichman:isRelatedTo ?related . \n"
                + "          ?related deichman:work ?relatedWork . \n"
                + "         OPTIONAL { ?relatedWork deichman:contributor ?relworkContrib .\n"
                + "               ?relworkContrib a deichman:MainEntry ;\n"
                + "                               deichman:agent ?relworkMainEntry . }\n"
                + "        }\n"
                + "  UNION {  <__WORKURI__> deichman:contributor ?workContrib .\n"
                + "           ?workContrib a deichman:Contribution ;\n"
                + "               deichman:agent ?workContributor . \n"
                + "           OPTIONAL { ?workContributor deichman:nationality ?nation }"
                + "    }\n"
                + "  UNION {  ?publication deichman:publicationOf <__WORKURI__> ; \n"
                + "            a deichman:Publication . \n"
                + "          OPTIONAL { ?publication deichman:format ?format .\n"
                + "                  ?format rdfs:label ?label . }\n"
                + "          OPTIONAL { ?publication deichman:hasMediaType ?mediaType .\n"
                + "                  ?mediaType rdfs:label ?label . }\n"
                + "          OPTIONAL { ?publication deichman:contributor ?pubContrib. \n"
                + "                  ?pubContrib a deichman:Contribution ;\n"
                + "                    deichman:agent ?publicationContributor . }\n"
                + "          OPTIONAL { ?publication deichman:inSerial ?serialIssue . \n"
                + "                   ?serialIssue deichman:serial ?serial . }\n"
                + "          OPTIONAL { ?publication deichman:hasPlaceOfPublication ?place }\n"
                + "          OPTIONAL { ?publication deichman:publishedBy ?publishedBy }\n"
                + "          OPTIONAL { ?publication deichman:hasPublicationPart ?hasPublicationPart ."
                + "                     ?hasPublicationPart a deichman:PublicationPart;"
                + "                                  ?publicationPartProperties ?publicationPartValues ."
                + " }\n"
                + "    }\n"
                + "  UNION { <__WORKURI__> deichman:subject ?subject .\n"
                + "          OPTIONAL { ?subject deichman:contributor ?subContrib .\n"
                + "                     ?subContrib a deichman:Contribution ;\n"
                + "                        deichman:agent ?workAsSubjectAgent } }\n"
                + "  UNION { <__WORKURI__> deichman:hasInstrumentation ?instrumentation .\n"
                + "       ?instrumentation deichman:hasInstrument ?instrument     }\n"
                + "  UNION { <__WORKURI__> deichman:genre ?genre }\n"
                + "  UNION { <__WORKURI__> deichman:literaryForm ?litform }\n"
                + "  UNION { <__WORKURI__> deichman:hasWorkType ?hasWorkType }\n"
                + "  UNION { <__WORKURI__> deichman:hasCompositionType ?compType }\n"
                + "  UNION { <__WORKURI__> deichman:biography ?bio }\n"
                + "  UNION { <__WORKURI__> deichman:nationality ?country }\n"
                + "  UNION { <__WORKURI__> deichman:contentAdaptation ?contentAdaptation }\n"
                + "  UNION { <__WORKURI__> deichman:isPartOfWorkSeries ?workSeriesPart . \n"
                + "          ?workSeriesPart a deichman:WorkSeriesPart ;\n"
                + "                          deichman:workSeries ?workSeries .\n"
                + "  }"
                + "}";
        queryString = queryString.replaceAll("__WORKURI__", xuri.getUri());
        return QueryFactory.create(queryString);
    }

    public Query describePersonAndLinkedResources(String personId) {
        String queryString = format("#\n"
                + "PREFIX deichman: <%1$s>\n"
                + "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n"
                + "DESCRIBE <%2$s> ?name ?birth ?death ?personTitle ?nationality ?nationalityLabel ?work\n"
                + "WHERE {\n"
                + "    <%2$s> a deichman:Person .\n"
                + "    optional { <%2$s> deichman:name ?name . }\n"
                + "    optional { <%2$s> deichman:birthYear ?birth . }\n"
                + "    optional { <%2$s> deichman:deathYear ?death . }\n"
                + "    optional { <%2$s> deichman:personTitle ?personTitle . }\n"
                + "    optional { <%2$s> deichman:nationality ?nationality . \n"
                + "                 ?nationality rdfs:label ?nationalityLabel .\n"
                + "             }"
                + "  optional { ?work a deichman:Work ; deichman:contributor [ a deichman:Contribution ; deichman:agent <%2$s> ] }\n"
                + "}", BaseURI.ontology(), personId);
        return QueryFactory.create(queryString);
    }

    public Query describeCorporationAndLinkedResources(String corporationId) {
        String queryString = format("#\n"
                + "PREFIX deichman: <%1$s>\n"
                + "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n"
                + "DESCRIBE <%2$s> ?nationality ?nationalityLabel ?place\n"
                + "WHERE {\n"
                + "     {\n"
                + "      <%2$s> a deichman:Corporation .\n"
                + "      optional { <%2$s> deichman:nationality ?nationality . \n"
                + "                  ?nationality rdfs:label ?nationalityLabel .\n"
                + "     }\n"
                + "  } \n"
                + "   UNION {"
                + "      <%2$s> deichman:place ?place . \n"
                + "      ?place a deichman:Place .\n"
                + "      <%2$s> deichman:place ?place . \n"
                + "  }\n"
                + "  UNION { ?work a deichman:Work ; deichman:contributor [ a deichman:Contribution ; deichman:agent <%2$s> ] }\n"
                + "}", BaseURI.ontology(), corporationId);
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
        String q = "PREFIX deichman: <" + BaseURI.ontology() + ">\n"
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

    public String patch(List<Patch> patches, Resource subject) {
        StringBuilder q = new StringBuilder();
        if (subject != null) {
            q.append(String.format(""
                            + "DELETE { <%s> <%smodified> ?modified }"
                            + "WHERE { <%s> <%smodified> ?modified };",
                    subject.getURI(), BaseURI.ontology(), subject.getURI(), BaseURI.ontology()));
        }
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
                .collect(joining(""));

        String bnodeObjectCheck = patches.stream()
                .filter(s -> s.getStatement().getObject().isAnon())
                .map(s -> {
                    return "a";
                })
                .collect(joining());

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
                    ).filter(s -> !s.isEmpty()).collect(joining());

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
                ).filter(s -> !s.isEmpty()).collect(joining());

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
        String q = format(""
                + "PREFIX deichman: <%1$s>\n"
                + "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n"
                + "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>\n"
                + "PREFIX dcterms: <http://purl.org/dc/terms/>\n"
                + "DESCRIBE ?work <%2$s>\n"
                + "WHERE {\n"
                + "      ?work a deichman:Work ;\n"
                + "            deichman:contributor ?contrib .\n"
                + "      ?contrib deichman:agent <%2$s> .\n"
                + "}", BaseURI.ontology(), xuri.getUri());
        return QueryFactory.create(q);
    }

    public Query describeLinkedPublications(XURI xuri) {
        String q = format(""
                + "PREFIX deichman: <%s>\n"
                + "DESCRIBE ?publication WHERE \n"
                + "    {\n"
                + "        ?publication deichman:publicationOf <%s>\n"
                + "    }", BaseURI.ontology(), xuri.getUri());
        return QueryFactory.create(q);
    }

    public Query selectAllUrisOfType(String type) {
        String q = format(""
                + "PREFIX deichman: <%s>\n"
                + "SELECT ?uri WHERE \n"
                + "    {\n"
                + "        ?uri a deichman:%s .\n"
                + "    }", BaseURI.ontology(), capitalize(type));
        return QueryFactory.create(q);
    }

    public String deleteBiblioReferences(String recordId) {
        String q = format(""
                        + "PREFIX : <%s>\n"
                        + "DELETE { ?pub :recordId \"%s\" ; :hasHomeBranch ?homeBranch ; :hasAvailableBranch ?availBranch ; :hasNumItems ?numItems }\n"
                        + "WHERE  { ?pub :recordId \"%s\" .\n"
                        + "         OPTIONAL { ?pub :hasNumItems ?numItems }\n"
                        + "         OPTIONAL { ?pub :hasHomeBranch ?homeBranch }\n"
                        + "         OPTIONAL { ?pub :hasAvailableBranch ?availBranch }\n"
                        + "}\n",
                BaseURI.ontology(), recordId, recordId);
        return q;
    }

    public String updateAvailabilityData(String recordId, String homeBranches, String availableBranches, int numItems) {
        List<String> inserts = newArrayList();
        if (homeBranches != null && !homeBranches.equals("")) {
            inserts.add("?pub :hasHomeBranch \"" + StringUtils.join(homeBranches.split(","), "\",\"") + "\"");
        }
        if (availableBranches != null && !availableBranches.equals("")) {
            inserts.add("?pub :hasAvailableBranch \"" + StringUtils.join(availableBranches.split(","), "\",\"") + "\"");
        }
        inserts.add("?pub :hasNumItems " + numItems);
        String q = format(""
                        + "PREFIX : <%s>\n"
                        + "DELETE { ?pub :hasHomeBranch ?homeBranch ; :hasAvailableBranch ?availBranch ; :hasNumItems ?numItems }\n"
                        + "INSERT { %s }\n"
                        + "WHERE  { ?pub :recordId \"%s\" .\n"
                        + "         OPTIONAL { ?pub :hasNumItems ?numItems }\n"
                        + "         OPTIONAL { ?pub :hasHomeBranch ?homeBranch }\n"
                        + "         OPTIONAL { ?pub :hasAvailableBranch ?availBranch }\n"
                        + "}\n",
                BaseURI.ontology(), StringUtils.join(inserts, " .\n"), recordId);
        return q;
    }

    public Query getPublicationByRecordId(String recordId) {
        String q = format(""
                        + "PREFIX : <%s>\n"
                        + "SELECT ?pub\n"
                        + "WHERE { ?pub :recordId \"%s\" . }\n",
                BaseURI.ontology(), recordId);
        return QueryFactory.create(q);
    }

    Query getPublicationAndWorkContributorURIByRecordId(String recordId) {
        String query = format(""
                + "PREFIX : <%s>\n"
                + "SELECT ?publicationUri\n"
                + "       ?workUri\n"
                + "       ?agentUri\n"
                + "       ?contributorName\n"
                + "       ?contributorNationality\n"
                + "       ?mainTitle\n"
                + "       ?partTitle\n"
                + "       ?partNumber\n"
                + "       ?subtitle\n"
                + "       ?publicationImage\n"
                + "       (str(?year) AS ?publicationYear)\n"
                + "       ?mediaType\n"
                + "       ?role\n"
                + "WHERE {\n"
                + "  ?publicationUri :recordId \"%s\" ;\n"
                + "                  :publicationOf ?workUri .\n"
                + "  OPTIONAL { ?publicationUri :mainTitle ?mainTitle }\n"
                + "  OPTIONAL { ?publicationUri :partTitle ?partTitle }\n"
                + "  OPTIONAL { ?publicationUri :partNumber ?partNumber }\n"
                + "  OPTIONAL { ?publicationUri :subtitle ?subtitle }\n"
                + "  OPTIONAL { ?publicationUri :publicationYear ?year }\n"
                + "  OPTIONAL { ?publicationUri :hasMediaType ?mediaType }\n"
                + "  OPTIONAL { ?workUri :contributor ?contribution .\n"
                + "             ?contribution a :MainEntry, :Contribution ;\n"
                + "                          :agent ?agentUri ;\n"
                + "                          :role ?role .\n"
                + "             ?agentUri :name ?contributorName .\n"
                + "             OPTIONAL { ?agentUri :nationality ?contributorNationality }\n"
                + "   }\n"
                + "   OPTIONAL { ?publicationUri :hasImage ?publicationImage }\n"
                + "}", BaseURI.ontology(), recordId);
        return QueryFactory.create(query);
    }

    public Query selectWorksByAgent(XURI agent) {
        String q = format(""
                + "PREFIX deichman: <%1$s>\n"
                + "SELECT ?work\n"
                + "WHERE {\n"
                + "  ?work a deichman:Work ;\n"
                + "    deichman:contributor ?contrib .\n"
                + "  ?contrib  deichman:agent <%2$s> .\n"
                + "}", BaseURI.ontology(), agent.getUri());
        return QueryFactory.create(q);
    }

    public Query constructInformationForMARC(XURI publication) {
        String q = ""
                + "PREFIX deichman: <http://data.deichman.no/ontology#>\n"
                + "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n"
                + "CONSTRUCT {\n"
                + " <__PUBLICATIONURI__> deichman:mainTitle ?mainTitle ;\n"
                + "       deichman:partTitle ?partTitle ;\n"
                + "       deichman:subtitle ?subtitle ;\n"
                + "       deichman:partNumber ?partNumber ;\n"
                + "       deichman:isbn ?isbn ;\n"
                + "       deichman:publicationYear ?publicationYear ;\n"
                + "       deichman:publicationPlace ?placeLabel ;\n"
                + "       deichman:ageLimit ?ageLimit ;\n"
                + "       deichman:mainEntryPerson ?mainEntryPersonName ;\n"
                + "       deichman:mainEntryCorporation ?mainEntryCorporationName ;\n"
                + "       deichman:subject ?subjectLabelAndSpecification ;\n"
                + "       deichman:formatLabel ?formatLabel ;\n"
                + "       deichman:language ?language ;\n"
                + "       deichman:workType ?workType ;\n"
                + "       deichman:mediaType ?mediaTypeLabel ;\n"
                + "       deichman:literaryForm ?literaryForm ;\n"
                + "       deichman:literaryFormLabel ?literaryFormLabel ;\n"
                + "       deichman:adaptationLabel ?formatAdaptationLabel ;\n"
                + "       deichman:adaptationLabel ?contentAdaptationLabel ;\n"
                + "       deichman:genre ?genreLabel ;\n"
                + "       deichman:fictionNonfiction ?fictionNonfiction ;\n"
                + "       deichman:summary ?summary ;"
                + "       deichman:audience ?audienceLabel ;\n"
                + "       deichman:locationFormat ?locationFormat ;\n"
                + "       deichman:locationDewey ?locationDewey ;\n"
                + "       deichman:locationSignature ?locationSignature ;\n"
                + "       deichman:cataloguingSourceLabel ?CSLabel ;\n"
                + "       deichman:cataloguingSourceIdentifier ?CSIdentifier .\n"
                + "}\n"
                + "WHERE {\n"
                + "        { <__PUBLICATIONURI__> deichman:mainTitle ?mainTitle } \n"
                + "  UNION { <__PUBLICATIONURI__> deichman:subtitle ?subtitle }\n"
                + "  UNION { <__PUBLICATIONURI__> deichman:partTitle ?partTitle }\n"
                + "  UNION { <__PUBLICATIONURI__> deichman:hasSummary ?summary }\n"
                + "  UNION { <__PUBLICATIONURI__> deichman:partNumber ?partNumber }\n"
                + "  UNION { <__PUBLICATIONURI__> deichman:isbn ?isbn }\n"
                + "  UNION { <__PUBLICATIONURI__> deichman:publicationYear ?publicationYear }\n"
                + "  UNION { <__PUBLICATIONURI__> deichman:language ?language }\n"
                + "  UNION { <__PUBLICATIONURI__> deichman:ageLimit ?ageLimit }\n"
                + "  UNION { <__PUBLICATIONURI__> deichman:hasPlaceOfPublication ?place . ?place deichman:prefLabel ?placeLabel }\n"
                + "  UNION { <__PUBLICATIONURI__> deichman:locationFormat ?locationFormat }\n"
                + "  UNION { <__PUBLICATIONURI__> deichman:locationClassNumber ?locationDewey }\n"
                + "  UNION { <__PUBLICATIONURI__> deichman:locationSignature ?locationSignature } \n"
                + "  UNION { <__PUBLICATIONURI__> deichman:hasPrimaryCataloguingSource ?cs .\n"
                + "     ?cs rdfs:label ?CSLabel . \n"
                + "     FILTER(lang(?CSLabel) = \"no\")\n"
                + "  }"
                + "  UNION { <__PUBLICATIONURI__> deichman:hasIdentifierInPrimaryCataloguingSource ?CSIdentifier }\n"
                + "  UNION { <__PUBLICATIONURI__> deichman:hasMediaType ?mediaType .\n"
                + "     ?mediaType rdfs:label ?mediaTypeLabel .\n"
                + "     FILTER(lang(?mediaTypeLabel) = \"no\")\n"
                + "  }"
                + "\n"
                + "  UNION { <__PUBLICATIONURI__> deichman:format ?format .\n"
                + "     ?format rdfs:label ?formatLabel .\n"
                + "     FILTER(lang(?formatLabel) = \"no\")\n"
                + "  }"
                + "  UNION { <__PUBLICATIONURI__> deichman:publicationOf ?work ."
                + "     ?work deichman:audience ?audience .\n"
                + "     ?audience rdfs:label ?audienceLabel .\n"
                + "     FILTER(lang(?audienceLabel) = \"no\")\n"
                + "  }"
                + "  UNION { <__PUBLICATIONURI__> deichman:hasFormatAdaptation ?formatAdaptation .\n"
                + "     ?formatAdaptation rdfs:label ?formatAdaptationLabel .\n"
                + "     FILTER(lang(?formatAdaptationLabel) = \"no\")\n"
                + "  }"
                + "\n"
                + "  UNION { "
                + "    <__PUBLICATIONURI__>  deichman:publicationOf ?work .\n"
                + "     ?work a deichman:Work ;\n"
                + "     deichman:hasContentAdaptation ?contentAdaptation .\n"
                + "     ?contentAdaptation rdfs:label ?contentAdaptationLabel .\n"
                + "     FILTER(lang(?contentAdaptationLabel) = \"no\")\n"
                + "  }\n"
                + "  UNION { "
                + "    <__PUBLICATIONURI__>  deichman:publicationOf ?work .\n"
                + "     ?work a deichman:Work .\n"
                + "     OPTIONAL { ?work deichman:hasWorkType ?type .\n"
                + "       ?type rdfs:label ?workType .\n"
                + "       FILTER(lang(?workType) = \"no\")\n"
                + "     }\n"
                + "  }\n"
                + "  UNION {\n"
                + "    <__PUBLICATIONURI__>  deichman:publicationOf ?work .\n"
                + "    ?work deichman:contributor ?contrib .\n"
                + "    ?contrib a deichman:MainEntry ;\n"
                + "      deichman:agent ?agent .\n"
                + "    OPTIONAL { ?agent a deichman:Person ; deichman:name ?mainEntryPersonName . }\n"
                + "    OPTIONAL { ?agent a deichman:Corporation ; deichman:name ?mainEntryCorporationName . }\n"
                + "  }\n"
                + "  UNION {\n"
                + "    <__PUBLICATIONURI__>  deichman:publicationOf ?work .\n"
                + "    ?work deichman:subject ?subject .\n"
                + "    ?subject deichman:prefLabel ?subjectLabel .\n"
                + "    OPTIONAL { ?subject deichman:specification ?subjectSpecification .} \n"
                + "    BIND(IF(BOUND(?subjectSpecification), CONCAT(?subjectLabel, \"__\", ?subjectSpecification), ?subjectLabel) AS ?subjectLabelAndSpecification)"
                + "  }\n"
                + "  UNION {\n"
                + "    <__PUBLICATIONURI__>  deichman:publicationOf ?work .\n"
                + "    ?work deichman:subject ?subject .\n"
                + "    ?subject deichman:name ?subjectLabel .\n"
                + "    OPTIONAL { ?subject deichman:specification ?subjectSpecification .} \n"
                + "    BIND(IF(BOUND(?subjectSpecification), CONCAT(?subjectLabel, \"__\", ?subjectSpecification), ?subjectLabel) AS ?subjectLabelAndSpecification)"
                + "  }\n"
                + "  UNION {\n"
                + "    <__PUBLICATIONURI__>  deichman:publicationOf ?work .\n"
                + "    ?work deichman:genre ?genre .\n"
                + "    ?genre deichman:prefLabel ?genreLabel .\n"
                + "  }\n"
                + "  UNION { "
                + "    <__PUBLICATIONURI__>  deichman:publicationOf ?work .\n"
                + "    ?work deichman:literaryForm ?literaryForm .\n"
                + "    ?literaryForm rdfs:label ?literaryFormLabel .\n"
                + "    FILTER(lang(?literaryFormLabel) = \"no\")\n"
                + "  }\n"
                + "  UNION { <__PUBLICATIONURI__>  deichman:publicationOf ?work . ?work  deichman:fictionNonfiction ?fictionNonfiction }"
                + "}";
        q = q.replaceAll("__PUBLICATIONURI__", publication.getUri());

        return QueryFactory.create(q);
    }

    public Query getRecordIdsByWork(XURI xuri) {
        String queryString = "SELECT ?recordId\n"
                + "WHERE {\n"
                + "  ?p <http://data.deichman.no/ontology#publicationOf> <" + xuri.getUri() + "> ;\n"
                + "     <http://data.deichman.no/ontology#recordId> ?recordId\n"
                + "}\n";
        return QueryFactory.create(queryString);
    }

    public Query constructInversePublicationRelations(XURI workUri) {
        String query = "PREFIX deichman: <http://data.deichman.no/ontology#>\n"
                + "CONSTRUCT {<" + workUri.getUri() + "> deichman:hasPublication ?publication} WHERE {?publication deichman:publicationOf <" + workUri.getUri() + ">}";
        return QueryFactory.create(query);
    }

    public Query getNumberOfRelationsForResource(XURI xuri) {
        String queryString = format("PREFIX deich: <http://data.deichman.no/ontology#>\n"
                + "SELECT ?type (COUNT(?a) as ?references)\n"
                + "WHERE {\n"
                + "  ?a ?b <%s> ;\n"
                + "     a ?type .\n"
                + "  FILTER(STRSTARTS(STR(?type), \"http://data.deichman.no/ontology#\"))"
                + "}\n"
                + "GROUP BY ?type ", xuri.getUri());
        return QueryFactory.create(queryString);
    }

    public Query constructFromQueryAndProjection(EntityType entityType, Map<String, String> queryParameters, Collection<String> projection) {
        Stream<String> start = of("prefix deichman:<http://data.deichman.no/ontology#>\n"
                + "construct {"
                + "     ?uri a ?type .\n");
        Stream<String> conditionals = queryParameters
                .entrySet()
                .stream()
                .map(entry -> format(" ?uri deichman:%s %s .", entry.getKey(), createTypedLiteral(entry.getValue()).asNode().toString()));

        Stream<String> type = of(format(" ?uri a deichman:%s .", org.apache.commons.lang3.StringUtils.capitalize(entityType.getPath())));
        Stream<String> selects = projection.stream().map(property -> format(" OPTIONAL { ?uri deichman:%s ?%s } ", property, property));
        Stream<String> projections = projection.stream().map(property -> format(" ?uri deichman:%s ?%s .", property, property));

        Stream<String> where = of("}\n"
                + "where {"
                + "     ?uri a ?type .\n ");

        Stream<String> end = newArrayList("}\n").stream();
        String query = concat(start, concat(projections, concat(where, concat(type, concat(conditionals, concat(selects, end)))))).collect(joining("\n"));
        return QueryFactory.create(query);
    }

    public Query describePublicationFromParsedCoreISBNQuery(String isbn) {
        String strippedIsbn = isbn.replaceAll("-", "").replaceAll(STARTSWITH_NINE_SEVEN_EIGHT, "");
        String parsedIsbnCore = strippedIsbn.substring(0, Math.min(strippedIsbn.length(), 9));
        String queryString = format("PREFIX deichman: <%1$s>\n"
                + "DESCRIBE ?uri\n"
                + "WHERE {\n"
                + "    VALUES ?isbnInput { \'%2$s\' }\n"
                + "     ?uri deichman:isbn ?isbn .\n"
                + "     BIND( SUBSTR(REPLACE( REPLACE (?isbn, \'" + VALID_ISBN_CHARS + "\', ''), \"" + STARTSWITH_NINE_SEVEN_EIGHT + "\", ''), 1,9) AS ?isbnCore)\n"
                + "     FILTER( ?isbnCore = ?isbnInput )\n"
                + "}", BaseURI.ontology(), parsedIsbnCore);
        return QueryFactory.create(queryString);
    }

    public String patch(List<Patch> deleteModelAsPatches) {
        return patch(deleteModelAsPatches, null);
    }

    public Query describeEventAndLinkedResources(XURI eventUri) {
        String queryString = format("#\n"
                + "PREFIX deichman: <%1$s>\n"
                + "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n"
                + "DESCRIBE <%2$s> ?place\n"
                + "WHERE {\n"
                + "   { <%2$s> a deichman:Event . }\n"
                + "  UNION {"
                + "      <%2$s> deichman:place ?place . \n"
                + "      ?place a deichman:Place .\n"
                + "  }\n"
                + "}", BaseURI.ontology(), eventUri);
        return QueryFactory.create(queryString);
    }

    public Query describeSerialAndLinkedResources(XURI serialUri) {
        String queryString = format("#\n"
                + "PREFIX deichman: <%1$s>\n"
                + "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n"
                + "DESCRIBE <%2$s> ?publisher ?publisherPlace\n"
                + "WHERE {\n"
                + "   { <%2$s> a deichman:Serial . }\n"
                + "  UNION {"
                + "      <%2$s> deichman:publishedBy ?publisher . \n"
                + "  }\n"
                + "  UNION {"
                + "      <%2$s> deichman:publishedBy ?publisher . \n"
                + "      ?publisher deichman:place ?publisherPlace . \n"
                + "      ?publisherPlace a deichman:Place .\n"
                + "  }\n"
                + "}", BaseURI.ontology(), serialUri);
        return QueryFactory.create(queryString);
    }

    public Query retriveResourceRelationships(XURI uri) {
        String queryString = format(""
                + "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\n"
                + "prefix deich: <%1$s>\n"
                + "prefix role: <%2$s>\n"
                + "select distinct ?relation ?targetUri ?mainTitle ?subtitle ?partTitle ?partNumber ?publicationYear ?type ?isMainEntry ?isRole\n"
                + "where {\n"
                + "  {\n"
                + "    ?publication     deich:publicationOf       <%3$s> ;\n"
                + "                     deich:mainTitle          ?mainTitle ;\n"
                + "                     a                        deich:Publication .\n"
                + "    optional {    ?publication deich:subtitle           ?subtitle . \n"
                + "    } \n"
                + "    optional {    ?publication deich:partTitle          ?partTitle . \n"
                + "    } \n"
                + "    optional {    ?publication deich:partNumber         ?partNumber . \n"
                + "    } \n"
                + "    optional {    ?publication deich:publicationYear    ?publicationYear . \n"
                + "    } \n"
                + "                     bind(iri(deich:publicationOf) as ?relation) .\n"
                + "                     bind(?publication as ?targetUri) . \n"
                + "                     bind(iri(deich:Publication) as ?type) . \n"
                + "  } union {\n"
                + "    ?contribution    deich:agent              <%3$s> ;\n"
                + "                     deich:role               ?relation .\n"
                + "    ?withContributor deich:contributor        ?contribution ;\n"
                + "                     a                        ?type ;\n"
                + "                     deich:mainTitle          ?mainTitle .\n"
                + "    optional {"
                + "    ?withContributor deich:subtitle           ?subtitle . \n"
                + "    } \n"
                + "    optional {"
                + "    ?withContributor deich:partTitle          ?partTitle . \n"
                + "    } \n"
                + "    optional {"
                + "    ?withContributor deich:partNumber         ?partNumber . \n"
                + "    } \n"
                + "    optional {"
                + "    ?withContributor deich:publicationYear    ?publicationYear . \n"
                + "    } \n"
                + "    optional {"
                + "      ?contribution  a deich:MainEntry . \n"
                + "                     bind(true as ?isMainEntry) . \n"
                + "    } \n"
                + "                     bind(?withContributor as ?targetUri) . \n"
                + "                     bind(true as ?isRole) . \n"
                + "  } union {\n"
                + "    ?workRelation    deich:work               <%3$s> ;\n"
                + "                     deich:hasRelationType    ?relation .\n"
                + "    ?withRelation    deich:isRelatedTo        ?workRelation ;\n"
                + "                     a                        ?type ;\n"
                + "                     deich:mainTitle          ?mainTitle .\n"
                + "    optional {"
                + "    ?withRelation    deich:subtitle           ?subtitle . \n"
                + "    } \n"
                + "    optional {"
                + "    ?withRelation    deich:partTitle          ?partTitle . \n"
                + "    } \n"
                + "    optional {"
                + "    ?withRelation    deich:partNumber         ?partNumber . \n"
                + "    } \n"
                + "    optional {"
                + "    ?withRelation    deich:publicationYear    ?publicationYear . \n"
                + "    } \n"
                + "                     bind(?withRelation as ?targetUri) . \n"
                + "  } union {\n"
                + "    ?seriesParticipation     deich:serial            <%3$s> .\n"
                + "    ?pubInSeries     deich:inSerial           ?seriesParticipation ;\n"
                + "                     a                        ?type ;\n"
                + "                     deich:mainTitle          ?mainTitle .\n"
                + "    optional {"
                + "    ?pubInSeries    deich:subtitle           ?subtitle . \n"
                + "    } \n"
                + "    optional {"
                + "    ?pubInSeries    deich:partTitle          ?partTitle . \n"
                + "    } \n"
                + "    optional {"
                + "    ?pubInSeries    deich:partNumber         ?partNumber . \n"
                + "    } \n"
                + "    optional {"
                + "    ?pubInSeries    deich:publicationYear    ?publicationYear . \n"
                + "    } \n"
                + "                     bind(iri(deich:inSerial) as ?relation) .\n"
                + "                     bind(?pubInSeries as ?targetUri) . \n"
                + "  } union {\n"
                + "    ?workSeriesParticipation     deich:workSeries  <%3$s> .\n"
                + "    ?workInSeries    deich:isPartOfWorkSeries ?workSeriesParticipation ;\n"
                + "                     a                        ?type ;\n"
                + "                     deich:mainTitle          ?mainTitle .\n"
                + "    optional {"
                + "    ?workInSeries    deich:subtitle           ?subtitle . \n"
                + "    } \n"
                + "    optional {"
                + "    ?workInSeries    deich:partTitle          ?partTitle . \n"
                + "    } \n"
                + "    optional {"
                + "    ?workInSeries    deich:partNumber         ?partNumber . \n"
                + "    } \n"
                + "    optional {"
                + "    ?workInSeries    deich:publicationYear    ?publicationYear . \n"
                + "    } \n"
                + "                     bind(iri(deich:isPartOfWorkSeries) as ?relation) .\n"
                + "                     bind(?workInSeries as ?targetUri) . \n"
                + "  } union {\n"
                + "    ?instrumentation        deich:hasInstrument  <%3$s> .\n"
                + "    ?workWithInstruments    deich:hasInstrumentation ?instrumentation ;\n"
                + "                            a                        ?type ;\n"
                + "                            deich:mainTitle          ?mainTitle .\n"
                + "    optional {"
                + "    ?workWithInstruments    deich:subtitle           ?subtitle . \n"
                + "    } \n"
                + "    optional {"
                + "    ?workWithInstruments    deich:partTitle          ?partTitle . \n"
                + "    } \n"
                + "    optional {"
                + "    ?workWithInstruments    deich:partNumber         ?partNumber . \n"
                + "    } \n"
                + "    optional {"
                + "    ?workWithInstruments    deich:publicationYear    ?publicationYear . \n"
                + "    } \n"
                + "                     bind(iri(deich:hasInstrumentation) as ?relation) .\n"
                + "                     bind(?workWithInstruments as ?targetUri) . \n"
                + "  } union {\n"
                + "    ?pubPart         deich:agent              <%3$s> ;\n"
                + "                     deich:role               ?relation .\n"
                + "    ?withPubPart     deich:hasPublicationPart ?pubPart .\n"
                + "    ?pubPart         a                        ?type ;\n"
                + "                     deich:mainTitle          ?mainTitle ; \n"
                + "                     bind(?withPubPart    as ?targetUri) . \n"
                + "                     bind(true as ?isRole) . \n"
                + "  } union {\n"
                + "    ?pubPart         deich:publicationOf      <%3$s> .\n"
                + "    ?withPubPart     deich:hasPublicationPart ?pubPart ;\n"
                + "                     deich:mainTitle          ?mainTitle . \n"
                + "    ?pubPart         a                        deich:PublicationPart ;\n"
                + "                     bind(iri(deich:hasPublicationPart) as ?relation) .\n"
                + "                     bind(?withPubPart    as ?targetUri) . \n"
                + "                     bind(iri(deich:Publication) as ?type) . \n"
                + "  } union {\n"
                + "    ?workWithSubj    deich:subject            <%3$s> ;\n"
                + "                     a                        ?type ;\n"
                + "                     deich:mainTitle          ?mainTitle .\n"
                + "    optional {"
                + "    ?workWithSubj    deich:subtitle           ?subtitle . \n"
                + "    } \n"
                + "    optional {"
                + "    ?workWithSubj    deich:partTitle          ?partTitle . \n"
                + "    } \n"
                + "    optional {"
                + "    ?workWithSubj    deich:partNumber         ?partNumber . \n"
                + "    } \n"
                + "    optional {"
                + "    ?workWithSubj    deich:publicationYear    ?publicationYear . \n"
                + "    } \n"
                + "                     bind(iri(deich:subject) as ?relation) .\n"
                + "                     bind(?workWithSubj      as ?targetUri) . \n"
                + "  } union {\n"
                + "    ?workWithCompType    deich:hasCompositionType <%3$s> ;\n"
                + "                     a                        ?type ;\n"
                + "                     deich:mainTitle          ?mainTitle .\n"
                + "    optional {"
                + "    ?workWithCompType    deich:subtitle           ?subtitle . \n"
                + "    } \n"
                + "    optional {"
                + "    ?workWithCompType    deich:partTitle          ?partTitle . \n"
                + "    } \n"
                + "    optional {"
                + "    ?workWithCompType    deich:partNumber         ?partNumber . \n"
                + "    } \n"
                + "    optional {"
                + "    ?workWithCompType    deich:publicationYear    ?publicationYear . \n"
                + "    } \n"
                + "                     bind(iri(deich:hasCompositionType) as ?relation) .\n"
                + "                     bind(?workWithCompType      as ?targetUri) . \n"
                + "  } union {\n"
                + "    ?workWithGenre   deich:genre              <%3$s> ;\n"
                + "                     a                        ?type ;\n"
                + "                     deich:mainTitle          ?mainTitle .\n"
                + "    optional {"
                + "    ?workWithGenre   deich:subtitle           ?subtitle . \n"
                + "    } \n"
                + "    optional {"
                + "    ?workWithGenre   deich:partTitle          ?partTitle . \n"
                + "    } \n"
                + "    optional {"
                + "    ?workWithGenre   deich:partNumber         ?partNumber . \n"
                + "    } \n"
                + "    optional {"
                + "    ?workWithGenre   deich:publicationYear    ?publicationYear . \n"
                + "    } \n"
                + "                     bind(iri(deich:genre) as ?relation) .\n"
                + "                     bind(?workWithGenre      as ?targetUri) . \n"
                + "  } union {\n"
                + "    ?publWithPlace   deich:hasPlaceOfPublication <%3$s> ;\n"
                + "                     a                        ?type ;\n"
                + "                     deich:mainTitle          ?mainTitle .\n"
                + "    optional {"
                + "    ?publWithPlace    deich:subtitle           ?subtitle . \n"
                + "    } \n"
                + "    optional {"
                + "    ?publWithPlace    deich:partTitle          ?partTitle . \n"
                + "    } \n"
                + "    optional {"
                + "    ?publWithPlace    deich:partNumber         ?partNumber . \n"
                + "    } \n"
                + "                     bind(iri(deich:hasPlaceOfPublication) as ?relation) .\n"
                + "                     bind(?publWithPlace      as ?targetUri) . \n"
                + "  }\n"
                + "  FILTER(STRSTARTS(STR(?type), \"http://data.deichman.no/ontology#\"))"
                + "} order by ?relation", BaseURI.ontology(), BaseURI.role(), uri.getUri());
        return QueryFactory.create(queryString);
    }

    public String mergeNodes(XURI xuri, XURI replaceeURI) {
        String queryString = format("INSERT {\n"
                + "  ?subj ?prop <%2$s> .\n"
                + "} WHERE {\n"
                + "  ?subj ?prop <%1$s> .\n"
                + "} ;\n"
                + "DELETE {\n"
                + "    <%1$s> ?a ?b .\n"
                + "    ?c ?d <%1$s> .\n"
                + "} WHERE {\n"
                + "    <%1$s> ?a ?b .\n"
                + "    ?c ?d <%1$s> .\n"
                + "}\n"
                + "\n", replaceeURI, xuri.getUri());
        return queryString;
    }

    public String deleteIncomingRelations(XURI xuri) {
        String queryString = format(""
                + "DELETE {\n"
                + "    ?a ?b <%1$s> .\n" // direct relations e.g. from work to subject
                + "    ?bn ?c <%1$s> .\n" // triple in blank node pointing to related resource
                + "    ?bn ?d ?e .\n" // blank node's other triples
                + "    ?f ?g ?bn .\n" //
                + "} WHERE {\n"
                + "  {\n"
                + "    ?a ?b <%1$s> .\n"
                + "  } UNION { \n"
                + "    ?bn ?c <%1$s> .\n"
                + "    ?bn ?d ?e .\n"
                + "    ?f ?g ?bn .\n"
                + "    filter(isBlank(?bn)) .\n"
                + "  }\n"
                + "}\n"
                + "\n", xuri.getUri());
        return queryString;
    }

    public Query getGetInverselyRelatedResourceByPredicate(String id, String predicate) {
        String queryString = format("prefix deich: <http://data.deichman.no/ontology#>\n"
                + "describe ?related \n"
                + "where {?related deich:%1$s <%2$s> }", predicate, id);
        return QueryFactory.create(queryString);
    }

    public Query relatedResourcesFor(XURI xuri) {
        String queryString = "PREFIX : <http://data.deichman.no/ontology#>\n"
                + "SELECT DISTINCT ?resource WHERE {\n";

        switch (xuri.getTypeAsEntityType()) {
            case PERSON:
            case CORPORATION:
                queryString += ""
                        + "      { ?resource :contributor [ a :Contribution ; :agent <__URI__> ] }\n"
                        + "UNION { ?publication :publicationOf ?resource . ?publication :contributor [ a :Contribution ; :agent <__URI__> ] }\n"
                        + "UNION { ?resource :publicationOf ?work . ?work :contributor [ a :Contribution ; :agent <__URI__> ] }\n"
                        + "UNION { ?resource :subject <__URI__> }\n"
                        + "UNION { ?resource :publishedBy <__URI__> }\n";
                break;
            case EVENT:
            case SUBJECT:
                queryString += ""
                        + "      { ?resource :subject <__URI__> }\n"
                        + "UNION { ?resource :publicationOf ?work . ?work :subject <__URI__> }\n";
                break;
            case GENRE:
                queryString += ""
                        + "      { ?resource :publicationOf ?work . ?work :genre <__URI__> }\n";
                break;
            case PLACE:
                queryString += ""
                        + "      { ?resource :hasPublicationPlace <__URI__> . }\n"
                        + "UNION { ?resource :subject <__URI__> . }\n"
                        + "UNION { ?resource :publicationOf ?work . ?work :subject <__URI__> }"
                        + "UNION { ?resource :place <__URI__> . }\n";
                break;
            case WORK_SERIES:
                queryString += ""
                        + "      { ?resource :isPartOfWorkSeries [ a :WorkSeriesPart ; :workSeries <__URI__> ] }\n";
                break;
            case SERIAL:
                queryString += "      ?resource :inSerial [ a :SerialIssue ; :serial <__URI__> ]\n";
                break;
            case PUBLICATION:
                queryString += "      ?work :publicationOf <__URI__> .\n";
                break;
            case WORK:
                queryString += ""
                        + "      { ?resource :publicationOf <__URI__> }\n"
                        + "UNION { ?resource :subject <__URI__> }\n"
                        + "UNION { ?resource :publicationOf ?work . ?work :subject <__URI__> }\n"
                        + "UNION { <__URI__> :contributor [ a :Contribution; :agent ?resource ] }\n";
                break;
            case MUSICAL_INSTRUMENT:
                queryString += ""
                        + "     ?resource :publicationOf ?work .\n"
                        + "     ?work :hasInstrumentation [ a :Instrumentation ; :hasInstrument <__URI__> ] .\n";
                break;
            case MUSICAL_COMPOSITION_TYPE:
                queryString += "    ?resource :publicationOf ?work . ?work :compositionType <__URI__> .\n";
                break;
            default:
                break;
        }

        queryString += "\nFILTER(isIRI(?resource)) }\n";

        return QueryFactory.create(queryString.replaceAll("__URI__", xuri.getUri()));
    }

    public Query resourceTemplateQuery(String type, Map<String, String> queryParameters) {
        String query = format(""
                + "PREFIX : <%s>\n"
                + "PREFIX duo: <http://data.deichman.no/utility#> \n"
                + "DESCRIBE ?template \n"
                + "WHERE { \n"
                + "   ?template a :%s ;\n"
                + "     duo:templateMatch [ \n"
                + "      %s\n"
                + "   ]\n"
                + "}\n", BaseURI.ontology(), EntityType.get(type).getRdfType(),
                (queryParameters.isEmpty() ? ImmutableMap.of("http://dummy/", "empty") : queryParameters)
                .entrySet()
                .stream()
                .map(entry -> format("<%s> <%s> ", entry.getKey(), entry.getValue()))
                .collect(joining(";\n")));

        return QueryFactory.create(query);
    }

    public String removeTemplateMatchTriples() {
        return format(""
                + "PREFIX duo: <%sutility#> \n"
                + "DELETE { ?uri duo:templateMatch ?templateMatch . ?templateMatch ?condPred ?condObj }\n"
                + "WHERE { \n"
                + "   ?uri duo:templateMatch ?templateMatch . ?templateMatch ?condPred ?condObj \n"
                + "}\n", BaseURI.root());
    }
}
