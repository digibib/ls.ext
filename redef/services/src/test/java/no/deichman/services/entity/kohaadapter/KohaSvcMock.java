package no.deichman.services.entity.kohaadapter;

import com.github.restdriver.clientdriver.ClientDriverRequest;
import com.github.restdriver.clientdriver.ClientDriverRule;
import no.deichman.services.testutil.PortSelector;
import org.junit.Rule;

import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.MediaType;
import java.io.IOException;
import java.util.regex.Pattern;
import java.util.stream.Stream;

import static com.github.restdriver.clientdriver.ClientDriverRequest.Method.POST;
import static com.github.restdriver.clientdriver.ClientDriverRequest.Method.PUT;
import static com.github.restdriver.clientdriver.RestClientDriver.giveResponse;
import static com.github.restdriver.clientdriver.RestClientDriver.onRequestTo;
import static javax.ws.rs.core.Response.Status.CREATED;
import static javax.ws.rs.core.Response.Status.OK;

/**
 * Responsibility: Encapsulate Koha svc endpoint mocking.
 */
public final class KohaSvcMock {

    private final int clientdriverPort = PortSelector.randomFree();

    @Rule
    private final ClientDriverRule clientDriver = new ClientDriverRule(clientdriverPort);

    public static String itemMarc(final String barcode) {
        return "<marcxml:datafield tag=\"" + MarcConstants.FIELD_952 + "\" ind1=\" \" ind2=\" \">"
                + "<marcxml:subfield code=\"a\">hutl</marcxml:subfield>"
                + "<marcxml:subfield code=\"b\">hutl</marcxml:subfield>"
                + "<marcxml:subfield code=\"c\">m</marcxml:subfield>"
                + "<marcxml:subfield code=\"l\">3</marcxml:subfield>"
                + "<marcxml:subfield code=\"m\">1</marcxml:subfield>"
                + "<marcxml:subfield code=\"o\">952 Cri</marcxml:subfield>"
                + "<marcxml:subfield code=\"p\">" + barcode + "</marcxml:subfield>"
                + "<marcxml:subfield code=\"q\">2014-11-05</marcxml:subfield>"
                + "<marcxml:subfield code=\"t\">1</marcxml:subfield>"
                + "<marcxml:subfield code=\"y\">L</marcxml:subfield>"
                + "</marcxml:datafield>";
    }

    public int getPort() {
        return clientdriverPort;
    }

    public void addLoginExpectation() {
        clientDriver.addExpectation(
                onRequestTo("/api/v1/auth/session")
                        .withMethod(POST)
                        .withBody("{\"userid\":\"api\",\"password\":\"secret\"}", MediaType.APPLICATION_JSON.toString()),
                giveResponse("{}", "application/json").withStatus(CREATED.getStatusCode())
                        .withHeader(HttpHeaders.SET_COOKIE, KohaAdapterImpl.SESSION_COOKIE_KEY + "=huh"));
    }

    public void addGetBiblioExpandedExpectation(String biblioId, String responseJSON) throws IOException {
        clientDriver.addExpectation(
                onRequestTo("/api/v1/biblios/" + biblioId+ "/expanded")
                        .withMethod(ClientDriverRequest.Method.GET)
                        .withHeader(HttpHeaders.COOKIE, Pattern.compile(".*CGISESSID=huh.*")),
                giveResponse(
                        responseJSON,
                        "application/json; charset=utf8"));
    }

    public void addGetBiblioExpectation(String biblioId, String responseJSON) throws IOException {
        clientDriver.addExpectation(
                onRequestTo("/api/v1/biblios/" + biblioId)
                        .withMethod(ClientDriverRequest.Method.GET)
                        .withHeader(HttpHeaders.COOKIE, Pattern.compile(".*CGISESSID=huh.*")),
                giveResponse(
                        responseJSON,
                        "application/json; charset=utf8"));
    }

    public void addLenientUpdateExpectation(String biblioId) {
        String responseXml = "<?xml version='1.0' standalone='yes'?>\n"
                + "<response>\n"
                + "  <biblionumber>" + biblioId + "</biblionumber>\n"
                + "  <marcxml>\n"
                + "<record\n"
                + "    xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"\n"
                + "    xsi:schemaLocation=\"http://www.loc.gov/MARC21/slim http://www.loc.gov/standards/marcxml/schema/MARC21slim.xsd\"\n"
                + "    xmlns=\"http://www.loc.gov/MARC21/slim\">\n"
                + "\n"
                + "  <leader>00049    a2200037   4500</leader>\n"
                + "  <datafield tag=\"999\" ind1=\" \" ind2=\" \">\n"
                + "    <subfield code=\"c\">26</subfield>\n"
                + "    <subfield code=\"d\">26</subfield>\n"
                + "  </datafield>\n"
                + "</record>\n"
                + "</marcxml>\n"
                + "  <status>ok</status>\n"
                + "</response>\n";

        clientDriver.addExpectation(
                onRequestTo("/api/v1/biblios/" + biblioId)
                        .withMethod(PUT)
                        .withBody(Pattern.compile("(?s).*"), MediaType.TEXT_XML)
                        .withHeader(HttpHeaders.COOKIE, Pattern.compile(".*CGISESSID=huh.*")),
                giveResponse(responseXml, "text/xml; charset=ISO-8859-1")
                        .withStatus(OK.getStatusCode()));
    }

    public void addGetBiblioExpandedExpectation(String biblioId, int noOfItems) throws IOException {
        String responseJSON = "{\n"
                + "  \"biblio\": {\n"
                + "    \"author\": \"Ragde, Anne B.\",\n"
                + "    \"biblionumber\": \"626460\",\n"
                + "    \"title\": \"Berlinerpoplene\"\n"
                + "  },\n"
                + "  \"items\": [\n"
                + itemsArray(biblioId, noOfItems)
                + "  ]\n"
                + "}";
        addGetBiblioExpandedExpectation(biblioId, responseJSON);
    }

    private String itemsArray(String biblioId, int noOfItems) {
        String[] items = new String[noOfItems];
        for (int i = 0; i < noOfItems; i++) {
            items[i] = itemObject(biblioId + "0" + i);
        }
        return String.join(",\n", items);
    }

    private String itemObject(final String barcode) {
        return "{\n"
                + "      \"barcode\": \"" + barcode + "\",\n"
                + "      \"biblionumber\": \"126\",\n"
                + "      \"holdingbranch\": \"hutl\",\n"
                + "      \"homebranch\": \"hutl\",\n"
                + "      \"itemcallnumber\": \"952 Cri\",\n"
                + "      \"itype\": \"L\",\n"
                + "      \"location\": \"m\",\n"
                + "      \"status\": \"Ledig\"\n"
                + "}";
    }

    public void addCreateNewBiblioExpectation(String returnedBiblioId) {
        String responseJSON = ""
                + "{\n"
                + "    \"biblionumber\": \"" + returnedBiblioId + "\", \n"
                + "    \"items\": \"\"\n"
                + "}\n";

        String expectedPayload = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
                + "<marcxml:collection xmlns:marcxml=\"http://www.loc.gov/MARC21/slim\">"
                + "<marcxml:record><marcxml:leader>00000    a2200000       </marcxml:leader>"
                + "</marcxml:record></marcxml:collection>\n";

        clientDriver.addExpectation(
                onRequestTo("/api/v1/biblios")
                        .withMethod(POST)
                        .withBody(expectedPayload, MediaType.TEXT_XML)
                        .withHeader(HttpHeaders.COOKIE, Pattern.compile(".*CGISESSID=huh.*")),
                giveResponse(responseJSON, "application/json; charset=utf8")
                        .withHeader("Location", "http://localhost:" + clientdriverPort + "/api/v1/biblios/" + returnedBiblioId)
                        .withStatus(CREATED.getStatusCode()));
    }

    public void addCreateNewBiblioWithItemsExpectation(String biblioId, String... barcode) {
        // TODO most likely this needs to be fixed
        String responseJSON = ""
                + "{\n"
                + "    \"biblionumber\": \"" + biblioId + "\", \n"
                + "    \"items\": \"1\"\n"
                + "}\n";

        // TODO most likely this needs to be fixed
        String expectedPayload = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
                + "<marcxml:collection xmlns:marcxml=\"http://www.loc.gov/MARC21/slim\">"
                + "<marcxml:record><marcxml:leader>00080    a2200049   4500</marcxml:leader>"
                + "<marcxml:datafield tag=\"" + MarcConstants.FIELD_245 + "\" ind1=\" \" ind2=\" \">"
                + "<marcxml:subfield code=\"a\">" + "Test test test" + "</marcxml:subfield>"
                + "</marcxml:datafield>"
                + Stream.of(barcode).map(KohaSvcMock::itemMarc).reduce("", String::concat)
                + "</marcxml:record>"
                + "</marcxml:collection>\n";

        clientDriver.addExpectation(
                onRequestTo("/api/v1/biblios")
                        .withMethod(POST)
                        .withBody(Pattern.compile("(?s).*"), MediaType.TEXT_XML)
                        .withHeader(HttpHeaders.COOKIE, Pattern.compile(".*CGISESSID=huh.*")),
                giveResponse(responseJSON, "application/json; charset=utf8")
                        .withHeader("Location", "http://localhost:" + clientdriverPort + "/api/v1/biblios/" + biblioId)
                        .withStatus(CREATED.getStatusCode()));
    }

    public void addCreateNewBiblioFromMarcXmlExpectation(String biblioId, String expectedPayload) {
        String responseJSON = ""
                + "{\n"
                + "    \"biblionumber\": \"" + biblioId + "\", \n"
                + "    \"items\": \"\"\n"
                + "}\n";
        clientDriver.addExpectation(
                onRequestTo("/api/v1/biblios")
                        .withMethod(POST)
                        .withBody(expectedPayload, MediaType.TEXT_XML)
                        .withHeader(HttpHeaders.COOKIE, Pattern.compile(".*CGISESSID=huh.*")),
                giveResponse(responseJSON, "application/json; charset=utf8")
                        .withHeader("Location", "http://localhost:" + clientdriverPort + "/api/v1/biblios/" + biblioId)
                        .withStatus(CREATED.getStatusCode()));
    }
}
