package no.deichman.services.kohaadapter;

import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;
import java.util.HashMap;
import java.util.Map;
import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.Invocation;
import javax.ws.rs.client.WebTarget;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.NewCookie;
import javax.ws.rs.core.Response;

public class KohaAdapterDefault implements KohaAdapter {

    private static Map<String, NewCookie> cookies = new HashMap<String, NewCookie>();

    public KohaAdapterDefault() {
        /*
         http = Net::HTTP.new(host, 8081)
         res = http.get("/cgi-bin/koha/svc/authentication?userid=#{SETTINGS['koha']['adminuser']}&password=#{SETTINGS['koha']['adminpass']}")
         res.body.should_not include("failed")
         @context[:svc_cookie] = res.response['set-cookie']
         */
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

        // http://koha-dev:8080/cgi-bin/koha/svc/bib/5678?userid=svcuser&password=svcpasswd
        String url = "http://192.168.50.12:8081/cgi-bin/koha/svc/"
                + "bib/" + id + "?userid=admin&password=secret";
        WebTarget webTarget = client.target(url);

        Invocation.Builder invocationBuilder
                = webTarget.request(MediaType.TEXT_XML);
        invocationBuilder.cookie(cookies.get("CGISESSID").toCookie());

        Response response = invocationBuilder.get();

        if (response.getStatus() == 200) {
            model = mapResponseToModel(id, response);
        }
        return model;
    }

    private Model mapResponseToModel(String id, Response response) {
        Model m = ModelFactory.createDefaultModel();
        String s = response.readEntity(String.class);
        return m;
    }

    public Map<String, NewCookie> getCookies () {
        return cookies;
    }
}
