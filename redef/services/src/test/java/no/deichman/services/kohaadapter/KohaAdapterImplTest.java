package no.deichman.services.kohaadapter;

import static com.github.restdriver.clientdriver.ClientDriverRequest.Method.POST;
import com.github.restdriver.clientdriver.ClientDriverRule;
import static com.github.restdriver.clientdriver.RestClientDriver.giveEmptyResponse;
import static com.github.restdriver.clientdriver.RestClientDriver.onRequestTo;
import javax.ws.rs.core.HttpHeaders;
import static javax.ws.rs.core.Response.Status.OK;
import static org.junit.Assert.assertNotNull;
import org.junit.Ignore;
import org.junit.Rule;
import org.junit.Test;

public class KohaAdapterImplTest {

    private static final int CLIENTDRIVER_PORT = 9210;

    private final KohaAdapterImpl kohaAdapter = new KohaAdapterImpl("http://localhost:" + CLIENTDRIVER_PORT);

    @Rule
    public final ClientDriverRule svcMock = new ClientDriverRule(CLIENTDRIVER_PORT);

    @Test
    public void should_have_default_constructor() {
        assertNotNull(new KohaAdapterImpl());
    }

    @Test @Ignore("Work in progress")
    public void should_return_a_biblio() throws Exception {
        svcMock.addExpectation(
                onRequestTo("/cgi-bin/koha/svc/authentication").withMethod(POST),
                giveEmptyResponse().withStatus(OK.getStatusCode()).withHeader(HttpHeaders.SET_COOKIE, KohaAdapterImpl.SESSION_COOKIE_KEY + "=huh"));


        assertNotNull(kohaAdapter.getBiblio("99"));
    }
}
