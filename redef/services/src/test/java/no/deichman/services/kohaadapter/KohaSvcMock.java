package no.deichman.services.kohaadapter;

import com.github.restdriver.clientdriver.ClientDriverRequest;
import com.github.restdriver.clientdriver.ClientDriverRule;
import no.deichman.services.testutil.PortSelector;
import org.junit.Rule;

import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.MediaType;
import java.io.IOException;
import java.util.regex.Pattern;

import static com.github.restdriver.clientdriver.ClientDriverRequest.Method.POST;
import static com.github.restdriver.clientdriver.RestClientDriver.giveResponse;
import static com.github.restdriver.clientdriver.RestClientDriver.onRequestTo;
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

    public void addLoginExpectation(){
        String authenticationOKResponse = "<?xml version='1.0' standalone='yes'?>\n"
                +"<response>\n"
                +"  <status>ok</status>\n"
                +"</response>";

        clientDriver.addExpectation(
                onRequestTo("/cgi-bin/koha/svc/authentication")
                        .withMethod(POST)
                        .withBody("userid=admin&password=secret", MediaType.APPLICATION_FORM_URLENCODED_TYPE.toString()),
                giveResponse(authenticationOKResponse, "text/xml").withStatus(OK.getStatusCode())
                        .withHeader(HttpHeaders.SET_COOKIE, KohaAdapterImpl.SESSION_COOKIE_KEY + "=huh"));
    }

    public void addGetBiblioExpectation(String biblioId, String responseMarcXML) throws IOException {
        clientDriver.addExpectation(
                onRequestTo("/cgi-bin/koha/svc/bib/" + biblioId)
                        .withMethod(ClientDriverRequest.Method.GET)
                        .withParam("items", 1)
                        .withHeader(HttpHeaders.COOKIE, Pattern.compile(".*CGISESSID=huh.*")),
                giveResponse(
                        responseMarcXML,
                        "application/xml"));
    }

    public void addPostNewBiblioExpectation(String returnedBiblioId) {
        String responseXml = "<?xml version='1.0' standalone='yes'?>\n"
                + "<response>\n"
                + "  <biblionumber>" + returnedBiblioId + "</biblionumber>\n"
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

        String expectedPayload = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
                + "<marcxml:collection xmlns:marcxml=\"http://www.loc.gov/MARC21/slim\">"
                + "<marcxml:record><marcxml:leader>00000     2200000       </marcxml:leader>"
                + "</marcxml:record>"
                + "</marcxml:collection>\n";

        clientDriver.addExpectation(
                onRequestTo("/cgi-bin/koha/svc/new_bib")
                        .withMethod(POST)
                        .withBody(expectedPayload, MediaType.TEXT_XML)
                        .withHeader(HttpHeaders.COOKIE, Pattern.compile(".*CGISESSID=huh.*")),
                giveResponse(responseXml, "text/xml; charset=ISO-8859-1")
                        .withStatus(OK.getStatusCode()));
    }
}
