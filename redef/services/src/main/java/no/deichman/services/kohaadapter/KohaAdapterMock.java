package no.deichman.services.kohaadapter;

import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;
import java.io.InputStream;

import org.marc4j.MarcReader;
import org.marc4j.MarcXmlReader;
import org.marc4j.marc.Record;

public class KohaAdapterMock implements KohaAdapter {

    private final Model model = ModelFactory.createDefaultModel();

    @Override
    public Model getBiblio(String biblioNo) {
        model.add(mapMarcToModel());
        return model;
    }

    private Model mapMarcToModel() {
        Model m = ModelFactory.createDefaultModel();
        InputStream in = getClass().getClassLoader().getResourceAsStream("marc.xml");
        MarcReader reader = new MarcXmlReader(in);
        Marc2Rdf marcRdf = new Marc2Rdf();
        while (reader.hasNext()) {
            Record record = reader.next();
            m.add(marcRdf.mapItemsToModel(record.getVariableFields("952")));
        }
        return m;
    }
}
