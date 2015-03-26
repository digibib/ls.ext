package no.deichman.services.kohaadapter;

import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;
import javax.ws.rs.core.NewCookie;
import org.marc4j.MarcReader;
import org.marc4j.MarcXmlReader;
import org.marc4j.marc.Record;

public class KohaAdapterMock implements KohaAdapter {

    private final Model model = ModelFactory.createDefaultModel();
    private static Map<String, NewCookie> cookies = new HashMap<String, NewCookie>();

    @Override
    public Model getBiblio(String biblioNo) {
        model.add(mapMarcToModel(biblioNo));
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

    private Model mapMarcToModel(String id) {
        Model m = ModelFactory.createDefaultModel();
        InputStream in = getClass().getClassLoader().getResourceAsStream("marc.xml");
        MarcReader reader = new MarcXmlReader(in);
        while (reader.hasNext()) {
            Record record = reader.next();
            m.add(Marc2Rdf.mapRecordToModel(record));
        }
        return m;
    }
}
