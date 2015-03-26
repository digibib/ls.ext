package no.deichman.services.kohaadapter;

import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;
import com.hp.hpl.jena.rdf.model.Property;
import com.hp.hpl.jena.rdf.model.Resource;
import com.hp.hpl.jena.rdf.model.ResourceFactory;
import com.hp.hpl.jena.rdf.model.Statement;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
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
import org.marc4j.marc.DataField;
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

    public Model mapMarcToModel(String id, String marc21Xml) {
        Model m = ModelFactory.createDefaultModel();
        System.out.println("DEBUG: Received marc from koha\n" + marc21Xml);
        InputStream in = new ByteArrayInputStream(marc21Xml.getBytes(StandardCharsets.UTF_8));
        MarcReader reader = new MarcXmlReader(in);
        while (reader.hasNext()) {
            Record record = reader.next();
            m.add(mapRecordToModel(record));
        }
        return m;
    }

    static final String NS = "http://deichman.no/exemplar/";
    static String resource;

    public static Model mapRecordToModel(Record record) {

        Model model = ModelFactory.createDefaultModel();

        model.setNsPrefix("", NS);
        model.setNsPrefix("xsd", "http://www.w3.org/2001/XMLSchema#");

        // Fetches all the items by getting all 952-fields:
        List exemplars = record.getVariableFields("952");
        Iterator i = exemplars.iterator();
        while (i.hasNext()) {
            DataField d = (DataField) i.next();
            model.add(mapIdToStatement(d.getSubfield('p').getData()));
            model.add(mapStatusToStatement(d.getSubfield('y').getData()));
            model.add(mapLocationToStatement(d.getSubfield('a').getData()));
        }

        return model;
    }

    private static Statement mapIdToStatement(String id) {
        setResource(id);
        Resource s = ResourceFactory.createResource(resource);
        Property p = ResourceFactory.createProperty("http://www.w3.org/1999/02/22-rdf-syntax-ns#type");
        Resource o = ResourceFactory.createResource("http://purl.org/vocab/frbr/core#Item");

        return ResourceFactory.createStatement(s, p, o);
    }

    private static Statement mapLocationToStatement(String location) {
        Resource s = ResourceFactory.createResource(resource);
        Property p = ResourceFactory.createProperty("http://purl.org/deichman/location");
        Resource o = ResourceFactory.createResource(location);

        return ResourceFactory.createStatement(s, p, o);
    }

    private static Statement mapStatusToStatement(String status) {
        Resource s = ResourceFactory.createResource(resource);
        Property p = ResourceFactory.createProperty("http://purl.org/deichman/status");
        Resource o = ResourceFactory.createResource(status);

        return ResourceFactory.createStatement(s, p, o);
    }


    static private void setResource(String id) {
        resource = new String(NS + id);
    }

    public Map<String, NewCookie> getCookies() {
        return cookies;
    }
}
