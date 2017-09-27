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
 * Responsibility: mock a SRU HTTP service.
 */
public class SRUServiceMock {

    private final int clientdriverPort = PortSelector.randomFree();

    @Rule
    private final ClientDriverRule clientDriver = new ClientDriverRule(clientdriverPort);

    public final int getPort() {
        return clientdriverPort;
    }

    public final void getSingleMarcRecordExpectation() {
        ResourceReader resourceReader = new ResourceReader();
        String responseData = resourceReader.readFile("BS_external_sru_data.xml");

        clientDriver.addExpectation(
                onRequestTo("/sru")
                        .withAnyParams()
                        .withMethod(GET),
                giveResponse(responseData, "text/xml").withStatus(OK.getStatusCode()));
    }

    public final void getMicroMarcSingleMarcRecordExpectation() {
        ResourceReader resourceReader = new ResourceReader();
        String responseData = resourceReader.readFile("BS_external_sru_data_micromarc.xml");

        clientDriver.addExpectation(
                onRequestTo("/mmwebapi/bibbi/6475/SRU")
                        .withAnyParams()
                        .withMethod(GET),
                giveResponse(responseData, "text/xml").withStatus(OK.getStatusCode()));
    }

}
