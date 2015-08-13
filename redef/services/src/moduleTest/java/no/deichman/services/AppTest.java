package no.deichman.services;

import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.Unirest;
import com.mashape.unirest.request.body.RequestBodyEntity;
import javax.ws.rs.core.Response.Status;
import no.deichman.services.kohaadapter.KohaSvcMock;
import no.deichman.services.testutil.PortSelector;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import static org.hamcrest.CoreMatchers.equalTo;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.assertTrue;

public class AppTest {

    public static final String TEST_BASEURI = "http://baseuri.example.com/";
    public static final boolean USE_IN_MEMORY_REPO = true;
    private int appPort;
    private App app;

    private KohaSvcMock kohaSvcMock;

    @Before
    public void setUp() throws Exception {
        System.setProperty("DATA_BASEURI", TEST_BASEURI);
        kohaSvcMock = new KohaSvcMock();
        appPort = PortSelector.randomFree(); // TODO consider moving to @BeforeClass?
        String svcEndpoint = "http://127.0.0.1:" + kohaSvcMock.getPort();
        app = new App(appPort, svcEndpoint, USE_IN_MEMORY_REPO);
        app.startAsync();
    }

    @After
    public void tearDown() throws Exception {
        app.stop();
    }

    @Test
    public void happy_day_scenario() throws Exception {
        kohaSvcMock.addLoginExpectation();
        kohaSvcMock.addPostNewBiblioExpectation("666");

        RequestBodyEntity request = Unirest
                .post("http://127.0.0.1:" + appPort + "/publication")
                .header("Accept", "application/ld+json")
                .header("Content-Type", "application/ld+json")
                .body("{}");

        HttpResponse<String> response = request.asString();

        assertThat("Unexpected response: " + response.getBody(),
                Status.fromStatusCode(response.getStatus()),
                equalTo(Status.CREATED)
        );

        final String location = response.getHeaders().getFirst("Location");

        assertTrue("Location not a URI", location.matches("(?:http|https)(?::\\/{2}[\\w]+)(?:[\\/|\\.]?)(?:[^\\s]*)"));

        // TODO extend test
        // add work with a couple of fields
        // add item to mock Koha
        // assert one of each
        // add another item
        // assert two items
        // add another publication
        // assert two items and two publications
        // add another item to second publication
        // assert three items and two publications
    }
}
