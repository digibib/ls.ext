package no.deichman.services.kohaadapter;

import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;
import org.marc4j.MarcReader;
import org.marc4j.MarcXmlReader;
import org.marc4j.marc.Record;

import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.Invocation;
import javax.ws.rs.client.WebTarget;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.NewCookie;
import javax.ws.rs.core.Response;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;


public class KohaAdapterDefault implements KohaAdapter {

    private static final String KOHA_PORT = System.getProperty("KOHA_PORT", "http://192.168.50.12:8081");
    private static final String KOHA_USER = System.getProperty("KOHA_USER", "admin");
    private static final String KOHA_PASSWORD = System.getProperty("KOHA_PASSWORD", "secret");

    private static Map<String, NewCookie> cookies = new HashMap<String, NewCookie>();

    public KohaAdapterDefault() {
        System.out.println("Koha adapter started with KOHA_PORT: " + KOHA_PORT);
    }

    @Override
    public void login() {
        String url = KOHA_PORT + "/cgi-bin/koha/svc/authentication?userid=" + KOHA_USER + "&password=" + KOHA_PASSWORD;
        Client client = ClientBuilder.newClient();
        WebTarget webTarget = client.target(url);

        Invocation.Builder invocationBuilder
                = webTarget.request();

        Response response = invocationBuilder.get();

        cookies = response.getCookies();
    }

    @Override
    public Model getBiblio(String id) {

        Model model = ModelFactory.createDefaultModel();
        Client client = ClientBuilder.newClient();

        String url = KOHA_PORT + "/cgi-bin/koha/svc/"
                + "bib/" + id + "?userid=" + KOHA_USER + "&password=" + KOHA_PASSWORD + "&items=1";
        WebTarget webTarget = client.target(url);

        Invocation.Builder invocationBuilder
                = webTarget.request(MediaType.TEXT_XML);
        invocationBuilder.cookie(cookies.get("CGISESSID").toCookie());

        Response response = invocationBuilder.get();

        if (response.getStatus() == 200) {
            model = mapMarcToModel(id, response.readEntity(String.class));
        }
        return model;
    }

    private Model mapMarcToModel(String id, String marc21Xml) {
        Model m = ModelFactory.createDefaultModel();
        System.out.println("DEBUG: Received marc from koha\n" + marc21Xml);
        InputStream in = new ByteArrayInputStream(marc21Xml.getBytes(StandardCharsets.UTF_8));
        MarcReader reader = new MarcXmlReader(in);
        while (reader.hasNext()) {
            Record record = reader.next();
            m.add(Marc2Rdf.mapRecordToModel(record));
        }
        return m;
    }

    public Map<String, NewCookie> getCookies() {
        return cookies;
    }
}
