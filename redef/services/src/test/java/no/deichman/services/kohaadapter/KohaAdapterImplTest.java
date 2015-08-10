package no.deichman.services.kohaadapter;

import com.github.restdriver.clientdriver.ClientDriverRequest.Method;
import static com.github.restdriver.clientdriver.ClientDriverRequest.Method.POST;
import com.github.restdriver.clientdriver.ClientDriverRule;
import static com.github.restdriver.clientdriver.RestClientDriver.giveResponse;
import static com.github.restdriver.clientdriver.RestClientDriver.onRequestTo;
import java.nio.charset.StandardCharsets;
import java.util.regex.Pattern;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.MediaType;
import static javax.ws.rs.core.Response.Status.OK;
import no.deichman.services.testutil.PortSelector;
import org.apache.commons.io.IOUtils;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import org.junit.Rule;
import org.junit.Test;

public class KohaAdapterImplTest {

    private final int clientdriverPort = PortSelector.randomFree();

    private final KohaAdapterImpl kohaAdapter = new KohaAdapterImpl("http://localhost:" + clientdriverPort);

    @Rule
    public final ClientDriverRule svcMock = new ClientDriverRule(clientdriverPort);

    private void login(){

        String authenticationOKResponse = "<?xml version='1.0' standalone='yes'?>\n"
                +"<response>\n"
                +"  <status>ok</status>\n"
                +"</response>";

        svcMock.addExpectation(
                onRequestTo("/cgi-bin/koha/svc/authentication")
                .withMethod(POST)
                .withBody("userid=admin&password=secret", MediaType.APPLICATION_FORM_URLENCODED_TYPE.toString()),
                giveResponse(authenticationOKResponse, "text/xml").withStatus(OK.getStatusCode())
                .withHeader(HttpHeaders.SET_COOKIE, KohaAdapterImpl.SESSION_COOKIE_KEY + "=huh"));

    }

    @Test
    public void should_have_default_constructor() {
        assertNotNull(new KohaAdapterImpl());
    }

    @Test
    public void should_return_a_biblio() throws Exception {

        login();

        svcMock.addExpectation(
                onRequestTo("/cgi-bin/koha/svc/bib/626460")
                .withMethod(Method.GET)
                .withParam("items", 1)
                .withHeader(HttpHeaders.COOKIE, Pattern.compile(".*CGISESSID=huh.*")),
                giveResponse(
                        IOUtils.toString(getClass().getClassLoader().getResourceAsStream("ragde.marcxml"), StandardCharsets.UTF_8),
                        "application/xml"));

        assertNotNull(kohaAdapter.getBiblio("626460"));
    }

    @Test
    public void should_return_new_biblio_ID() throws Exception {
        login();

        String responseXml = "<?xml version='1.0' standalone='yes'?>\n"
                + "<response>\n"
                + "  <biblionumber>26</biblionumber>\n"
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

        svcMock.addExpectation(
                onRequestTo("/cgi-bin/koha/svc/new_bib")
                .withMethod(POST)
                .withBody(expectedPayload, MediaType.TEXT_XML)
                .withHeader(HttpHeaders.COOKIE, Pattern.compile(".*CGISESSID=huh.*")),
                giveResponse(responseXml, "text/xml; charset=ISO-8859-1")
                .withStatus(OK.getStatusCode()));

        String biblioId = kohaAdapter.getNewBiblio();
        assertEquals("26",biblioId);
    }

}
