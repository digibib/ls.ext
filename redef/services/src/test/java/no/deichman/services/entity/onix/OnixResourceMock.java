package no.deichman.services.entity.onix;

import com.github.restdriver.clientdriver.ClientDriverRule;
import no.deichman.services.testutil.PortSelector;
import no.deichman.services.utils.ResourceReader;
import org.junit.Rule;

import static com.github.restdriver.clientdriver.ClientDriverRequest.Method.POST;
import static com.github.restdriver.clientdriver.RestClientDriver.giveResponse;
import static com.github.restdriver.clientdriver.RestClientDriver.onRequestTo;
import static javax.ws.rs.core.MediaType.APPLICATION_XML;

/**
 * Responsibility: mock the ONIX server response.
 */
class OnixResourceMock {

    private final int clientDriverPort = PortSelector.randomFree();

    @Rule
    private final ClientDriverRule clientDriver = new ClientDriverRule(clientDriverPort);

    int getPort() {
        return clientDriverPort;
    }

    void addLoginExpectation() {
        clientDriver.addExpectation(
                onRequestTo("/")
                        .withMethod(POST)
                        .withBody("username=userMe&password=asdsd&element&query", "application/x-www-form-urlencoded"),
                giveResponse("", APPLICATION_XML));
    }

    void addSearchExpectation() {
        clientDriver.addExpectation(
                onRequestTo("/")
                        .withMethod(POST)
                        .withBody("username=bilbobaggins&password=poachedSalmon&element=title&query=de+velvillige", "application/x-www-form-urlencoded"),
                giveResponse(new ResourceReader().readFile("onix_de_velvillige.xml"), APPLICATION_XML));
    }
}
