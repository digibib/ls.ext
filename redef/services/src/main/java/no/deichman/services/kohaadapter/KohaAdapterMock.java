package no.deichman.services.kohaadapter;

import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;
import no.deichman.services.uridefaults.BaseURIMock;
import org.apache.jena.riot.Lang;
import org.apache.jena.riot.RDFDataMgr;
import org.marc4j.MarcReader;
import org.marc4j.MarcXmlReader;
import org.marc4j.marc.Record;

import java.io.InputStream;

/**
 * Responsibility: TODO.
 */
public final class KohaAdapterMock implements KohaAdapter {

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
        Marc2Rdf marcRdf = new Marc2Rdf(new BaseURIMock());
        while (reader.hasNext()) {
            Record record = reader.next();
            m.add(marcRdf.mapItemsToModel(record.getVariableFields("952")));
        }
        RDFDataMgr.write(System.out, m, Lang.TTL);
        return m;
    }
}
