package no.deichman.services.entity.external;

import com.github.restdriver.clientdriver.ClientDriverRule;
import no.deichman.services.testutil.PortSelector;
import no.deichman.services.utils.ResourceReader;
import org.junit.Rule;

import static com.github.restdriver.clientdriver.ClientDriverRequest.Method.GET;
import static com.github.restdriver.clientdriver.RestClientDriver.giveResponse;
import static com.github.restdriver.clientdriver.RestClientDriver.onRequestTo;
import static javax.ws.rs.core.Response.Status.OK;

/**
 * Responsibility: mock a Z3950 HTTP service.
 */
public class Z3950ServiceMock {

    private final int clientdriverPort = PortSelector.randomFree();

    @Rule
    private final ClientDriverRule clientDriver = new ClientDriverRule(clientdriverPort);

    public final int getPort() {
        return clientdriverPort;
    }

    public final void getSingleMarcRecordExpectation() {
        ResourceReader resourceReader = new ResourceReader();
        String responseData = resourceReader.readFile("BS_external_data.xml");

        clientDriver.addExpectation(
                onRequestTo("/")
                        .withAnyParams()
                        .withMethod(GET),
                giveResponse(responseData, "text/xml").withStatus(OK.getStatusCode()));
    }

}
