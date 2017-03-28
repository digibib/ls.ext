package no.deichman.services.entity.kohaadapter;

import com.github.restdriver.clientdriver.ClientDriverRequest;
import com.github.restdriver.clientdriver.ClientDriverRule;
import no.deichman.services.testutil.PortSelector;
import org.junit.Rule;

import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.MediaType;
import java.io.IOException;
import java.util.regex.Pattern;

import static com.github.restdriver.clientdriver.ClientDriverRequest.Method.DELETE;
import static com.github.restdriver.clientdriver.ClientDriverRequest.Method.POST;
import static com.github.restdriver.clientdriver.ClientDriverRequest.Method.PUT;
import static com.github.restdriver.clientdriver.RestClientDriver.giveEmptyResponse;
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

    public int getPort() {
        return clientdriverPort;
    }

    public void addLoginExpectation() {
        clientDriver.addExpectation(
                onRequestTo("/api/v1/auth/session")
                        .withMethod(POST),
                giveResponse("{}", "application/json").withStatus(CREATED.getStatusCode())
                        .withHeader(HttpHeaders.SET_COOKIE, KohaAdapterImpl.SESSION_COOKIE_KEY + "=huh"));
    }

    public void addGetBiblioExpandedExpectation(String biblioId, String responseJSON) throws IOException {
        clientDriver.addExpectation(
                onRequestTo("/api/v1/biblios/" + biblioId + "/expanded")
                        .withMethod(ClientDriverRequest.Method.GET)
                        .withHeader(HttpHeaders.COOKIE, Pattern.compile(".*koha.session=huh.*")),
                giveResponse(
                        responseJSON,
                        "application/json; charset=utf8"));
    }

    public void addGetBiblioExpectation(String biblioId, String responseJSON) throws IOException {
        clientDriver.addExpectation(
                onRequestTo("/api/v1/biblios/" + biblioId)
                        .withMethod(ClientDriverRequest.Method.GET)
                        .withHeader(HttpHeaders.COOKIE, Pattern.compile(".*koha.session=huh.*")),
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
                        .withHeader(HttpHeaders.COOKIE, Pattern.compile(".*koha.session=huh.*")),
                giveResponse(responseXml, "text/xml; charset=ISO-8859-1")
                        .withStatus(OK.getStatusCode()));
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
                        .withHeader(HttpHeaders.COOKIE, Pattern.compile(".*koha.session=huh.*")),
                giveResponse(responseJSON, "application/json; charset=utf8")
                        .withHeader("Location", "http://localhost:" + clientdriverPort + "/api/v1/biblios/" + returnedBiblioId)
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
                        .withHeader(HttpHeaders.COOKIE, Pattern.compile(".*koha.session=huh.*")),
                giveResponse(responseJSON, "application/json; charset=utf8")
                        .withHeader("Location", "http://localhost:" + clientdriverPort + "/api/v1/biblios/" + biblioId)
                        .withStatus(CREATED.getStatusCode()));
    }

    public void addDeleteBibloExpectation(String biblioId) {
        clientDriver.addExpectation(
                onRequestTo("api/v1/biblios/" + biblioId)
                        .withMethod(DELETE)
                        .withHeader(HttpHeaders.COOKIE, Pattern.compile(".*koha.session=huh.*")),
                giveEmptyResponse().withStatus(OK.getStatusCode()));
    }
}
