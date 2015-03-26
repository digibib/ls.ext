package no.deichman.services.kohaadapter;

import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.Invocation;
import javax.ws.rs.client.WebTarget;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.NewCookie;
import javax.ws.rs.core.Response;
import org.marc4j.MarcReader;
import org.marc4j.MarcXmlReader;
import org.marc4j.marc.Record;

public class KohaAdapterDefault implements KohaAdapter {

    private static Map<String, NewCookie> cookies = new HashMap<String, NewCookie>();

    @Override
    public void login() {
        String url = "http://192.168.50.12:8081/cgi-bin/koha/svc/authentication?userid=admin&password=secret";
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

        String url = "http://192.168.50.12:8081/cgi-bin/koha/svc/"
                + "bib/" + id + "?userid=admin&password=secret&items=1";
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
