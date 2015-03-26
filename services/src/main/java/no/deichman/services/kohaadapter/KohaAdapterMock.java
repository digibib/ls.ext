package no.deichman.services.kohaadapter;

import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;
import java.util.HashMap;
import java.util.Map;
import javax.ws.rs.core.NewCookie;

public class KohaAdapterMock implements KohaAdapter {

    private final Model model = ModelFactory.createDefaultModel();
    private static Map<String, NewCookie> cookies = new HashMap<String, NewCookie>();

    @Override
    public Model getBiblio(String biblioNo) {
        return model;
    }

    @Override
    public void login() {
        cookies.put("Dummy", new NewCookie("Dummy", "Dummy"));
    }

    @Override
    public Map<String, NewCookie> getCookies() {
        return cookies;
    }

}
