package no.deichman.services.entity.kohaadapter;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import no.deichman.services.uridefaults.BaseURI;
import no.deichman.services.utils.ResourceReader;
import org.apache.jena.datatypes.xsd.XSDDatatype;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.vocabulary.XSD;
import org.marc4j.marc.DataField;
import org.marc4j.marc.VariableField;

import java.lang.reflect.Type;
import java.util.List;
import java.util.Map;

import static org.apache.jena.rdf.model.ResourceFactory.createPlainLiteral;
import static org.apache.jena.rdf.model.ResourceFactory.createProperty;
import static org.apache.jena.rdf.model.ResourceFactory.createResource;
import static org.apache.jena.rdf.model.ResourceFactory.createStatement;
import static org.apache.jena.rdf.model.ResourceFactory.createTypedLiteral;

/**
 * Responsibility: Maps KOHA MARC holdings data from field 952 to an RDF model.
 */
public final class Marc2Rdf {

    private static final String DEICHMAN_NS_EXEMPLAR = "http://deichman.no/exemplar/";
    private static final String RDF_SYNTAX_NS_TYPE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
    private static final String DEICHMAN_FORMAT = "format";
    private static final String DEICHMAN_ITEM = "Item";
    private static final String DEICHMAN_STATUS = "status";
    private static final String DEICHMAN_LOCATION = "location";
    private static final String DEICHMAN_BRANCH = "branch";
    private static final String DEICHMAN_BARCODE = "barcode";
    private static final String DUO_SHELFMARK = "shelfmark";
    private static final String DUO_NS = "http://data.deichman.no/utility#";
    private static final Character KOHA_NOT_FOR_LOAN = '7';
    private static final Character KOHA_ITEM_TYPE = 'y';
    private static final Character KOHA_ON_LOAN = 'q';
    private static final Character KOHA_HOMEBRANCH = 'a';
    private static final Character KOHA_BARCODE = 'p';
    private static final Character KOHA_CALL_NUMBER = 'o';
    private static final String KOHA_LOANABLE_VALUE = "0";
    private static final String DUO_ONLOAN = "onloan";

    private BaseURI baseURI;

    Marc2Rdf() {
        this(BaseURI.remote());
    }

    public Marc2Rdf(BaseURI base) {
        baseURI = base;
    }

    private Map<String, String> readBranchesJson() {
        Type type = new TypeToken<Map<String, String>>(){}.getRawType();
        return new Gson().fromJson(new ResourceReader().readFile("branches.json"), type);
    }

    private String getBranch(String code) {
        Map<String, String> branches = readBranchesJson();
        return branches.containsKey(code) ? branches.get(code) : code;
    }

    public BaseURI getBaseURI() {
        return baseURI;
    }

    public void setBaseURI(BaseURI base) {
        baseURI = base;
    }

    public Model mapItemsToModel(List<VariableField> itemsFields) {

        Model model = ModelFactory.createDefaultModel();

        model.setNsPrefix("", DEICHMAN_NS_EXEMPLAR);
        model.setNsPrefix("duo", DUO_NS);
        model.setNsPrefix("xsd", XSD.getURI());

        itemsFields.forEach(item -> {

            DataField itemData = (DataField) item;

            String notForLoan = itemData.getSubfield(KOHA_NOT_FOR_LOAN).getData();
            String barcode = itemData.getSubfield(KOHA_BARCODE).getData();

            String expectedReturnDate = "AVAIL";

            if (itemData.getSubfield(KOHA_ON_LOAN) != null) {
                expectedReturnDate = itemData.getSubfield(KOHA_ON_LOAN).getData();
            }

            Resource subject = createResource(baseURI.exemplar() + "e" + barcode);
            String ontologyNS = baseURI.ontology();


            model.add(
                    createStatement(
                            subject,
                            createProperty(RDF_SYNTAX_NS_TYPE),
                            createResource(ontologyNS + DEICHMAN_ITEM)
                    )
            );

            model.add(
                    createStatement(
                            subject,
                            createProperty(DUO_NS + DUO_ONLOAN),
                            createTypedLiteral(String.valueOf(isLoanable(expectedReturnDate, notForLoan)), XSDDatatype.XSDboolean)
                    )
            );
            model.add(
                    createStatement(
                            subject,
                            createProperty(ontologyNS + DEICHMAN_FORMAT),
                            createPlainLiteral(itemData.getSubfield(KOHA_ITEM_TYPE).getData())
                    )
            );
            model.add(
                    createStatement(
                            subject,
                            createProperty(ontologyNS + DEICHMAN_STATUS),
                            createPlainLiteral(expectedReturnDate))
            );
            model.add(
                    createStatement(
                            subject,
                            createProperty(ontologyNS + DEICHMAN_LOCATION),
                            createPlainLiteral(itemData.getSubfield(KOHA_HOMEBRANCH).getData())
                    )
            );
            model.add(
                    createStatement(
                            subject,
                            createProperty(ontologyNS + DEICHMAN_BRANCH),
                            createPlainLiteral(getBranch(itemData.getSubfield(KOHA_HOMEBRANCH).getData()))
                    )
            );
            model.add(
                    createStatement(
                            subject,
                            createProperty(ontologyNS + DEICHMAN_BARCODE),
                            createPlainLiteral(barcode)
                    )
            );
            model.add(
                    createStatement(
                            subject,
                            createProperty(DUO_NS + DUO_SHELFMARK),
                            createPlainLiteral(itemData.getSubfield(KOHA_CALL_NUMBER).getData())
                    )
            );
        });

        return model;
    }

    private boolean isLoanable(String expectedReturnDate, String loanableCode) {
        return !(loanableCode.equals(KOHA_LOANABLE_VALUE) && expectedReturnDate.contentEquals("AVAIL"));
    }
}
