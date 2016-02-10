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
        String authenticationOKResponse = "<?xml version='1.0' standalone='yes'?>\n"
                + "<response>\n"
                + "  <status>ok</status>\n"
                + "</response>";

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
                onRequestTo("/cgi-bin/koha/svc/bib/" + biblioId + "?items=0")
                        .withMethod(POST)
                        .withBody(Pattern.compile("(?s).*"), MediaType.TEXT_XML)
                        .withHeader(HttpHeaders.COOKIE, Pattern.compile(".*CGISESSID=huh.*")),
                giveResponse(responseXml, "text/xml; charset=ISO-8859-1")
                        .withStatus(OK.getStatusCode()));
    }

    public void addGetBiblioExpectation(String biblioId, int noOfItems) throws IOException {
        String responseMarcXML = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
                + "<record\n"
                + "    xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"\n"
                + "    xsi:schemaLocation=\"http://www.loc.gov/MARC21/slim http://www.loc.gov/standards/marcxml/schema/MARC21slim.xsd\"\n"
                + "    xmlns=\"http://www.loc.gov/MARC21/slim\">\n"
                + "\n"
                + "  <leader>00055    a2200037   4500</leader>\n"
                + "  <datafield tag=\"999\" ind1=\" \" ind2=\" \">\n"
                + "    <subfield code=\"c\">1528227</subfield>\n"
                + "    <subfield code=\"d\">1528227</subfield>\n"
                + "  </datafield>\n"
                + itemsXml(biblioId, noOfItems)
                + "</record>\n";
        addGetBiblioExpectation(biblioId, responseMarcXML);
    }

    private String itemsXml(String biblioId, int noOfItems) {
        StringBuilder result = new StringBuilder();
        for (int i = 0; i < noOfItems; i++) {
            result.append(itemXml(biblioId + "0" + i));
        }
        return result.toString();
    }

    private String itemXml(final String barcode) {
        return "  <datafield tag=\"" + MarcConstants.FIELD_952 + "\" ind1=\" \" ind2=\" \">\n"
                + "    <subfield code=\"0\">0</subfield>\n"
                + "    <subfield code=\"1\">0</subfield>\n"
                + "    <subfield code=\"2\">ddc</subfield>\n"
                + "    <subfield code=\"4\">0</subfield>\n"
                + "    <subfield code=\"7\">0</subfield>\n"
                + "    <subfield code=\"9\">73</subfield>\n"
                + "    <subfield code=\"a\">c3928c8f</subfield>\n"
                + "    <subfield code=\"b\">c3928c8f</subfield>\n"
                + "    <subfield code=\"d\">2015-08-17</subfield>\n"
                + "    <subfield code=\"o\">920 Tes</subfield>\n"
                + "    <subfield code=\"p\">" + barcode + "</subfield>\n"
                + "    <subfield code=\"r\">2015-08-17</subfield>\n"
                + "    <subfield code=\"w\">2015-08-17</subfield>\n"
                + "    <subfield code=\"y\">2177EA48</subfield>\n"
                + "  </datafield>\n";
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
                + "<marcxml:record><marcxml:leader>00000    a2200000       </marcxml:leader>"
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

    public void newBiblioWithItemsExpectation(String biblioId, String... barcode) {
        // TODO most likely this needs to be fixed
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
                onRequestTo("/cgi-bin/koha/svc/new_bib")
                        .withParam("items", "1")
                        .withMethod(POST)
                        .withBody(Pattern.compile("(?s).*"), MediaType.TEXT_XML)
                        .withHeader(HttpHeaders.COOKIE, Pattern.compile(".*CGISESSID=huh.*")),
                giveResponse(responseXml, "text/xml; charset=ISO-8859-1")
                        .withStatus(OK.getStatusCode()));
    }

    public void newBiblioFromMarcXmlExpectation(String biblioId, String expectedPayload) {
        String responseXml = "<response><biblionumber>" + biblioId + "</biblionumber></response>"; //Bare minimum response
        clientDriver.addExpectation(
                onRequestTo("/cgi-bin/koha/svc/new_bib")
                        .withMethod(POST)
                        .withBody(expectedPayload, MediaType.TEXT_XML)
                        .withHeader(HttpHeaders.COOKIE, Pattern.compile(".*CGISESSID=huh.*")),
                giveResponse(responseXml, "text/xml; charset=ISO-8859-1")
                        .withStatus(OK.getStatusCode()));
    }
}
