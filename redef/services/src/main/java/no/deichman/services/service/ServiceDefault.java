package no.deichman.services.service;

import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import com.hp.hpl.jena.query.Query;
import com.hp.hpl.jena.query.QueryExecution;
import com.hp.hpl.jena.query.QueryExecutionFactory;
import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;
import com.hp.hpl.jena.rdf.model.NodeIterator;
import com.hp.hpl.jena.rdf.model.Property;
import com.hp.hpl.jena.rdf.model.ResIterator;
import com.hp.hpl.jena.rdf.model.ResourceFactory;
import no.deichman.services.SPARQLQueryBuilder;
import no.deichman.services.error.PatchException;
import no.deichman.services.error.PatchParserException;
import no.deichman.services.kohaadapter.KohaAdapter;
import no.deichman.services.kohaadapter.KohaAdapterDefault;
import no.deichman.services.patch.Patch;
import no.deichman.services.patch.PatchObject;
import no.deichman.services.patch.PatchParser;
import no.deichman.services.patch.PatchRDF;
import no.deichman.services.repository.Repository;
import no.deichman.services.repository.RepositoryDefault;
import no.deichman.services.uridefaults.BaseURI;
import no.deichman.services.uridefaults.BaseURIDefault;

public class ServiceDefault implements Service {

    private Repository repository = new RepositoryDefault();
    private KohaAdapter kohaAdapter = new KohaAdapterDefault();
    private BaseURI baseURI;
    private Property BIBLIO_ID;

    public ServiceDefault(){
        baseURI = new BaseURIDefault();
        setBiblioIDProperty(baseURI.getOntologyURI());
    }

    public ServiceDefault(BaseURI base){
        baseURI = base;
        setBiblioIDProperty(baseURI.getOntologyURI());
    }

    @Override
    public Model retrieveWorkById(String id) {

        Model m = ModelFactory.createDefaultModel();
        m.add(repository.retrieveWorkById(id));

        return m;
    }

    @Override
    public void setRepository(Repository repository) {
        this.repository = repository;
    }

    @Override
    public Repository getRepository() {
        return repository;
    }

    public void setKohaAdapter(KohaAdapter kohaAdapter) {
        this.kohaAdapter = kohaAdapter;
    }

    public void setBiblioIDProperty(String uri){
        BIBLIO_ID = ResourceFactory.createProperty(uri + "biblio");
    }

    @Override
    public void updateWork(String work) {
        repository.updateWork(work);
    }

    @Override
    public Model retrieveWorkItemsById(String id) {
        Model allItemsModel = ModelFactory.createDefaultModel();
        Model model = ModelFactory.createDefaultModel();
        model.add(repository.retrieveWorkById(id));
        ResIterator subjectsIterator = model.listSubjects();

        while (subjectsIterator.hasNext()){
            Model tempModel = ModelFactory.createDefaultModel();
            NodeIterator n = model.listObjectsOfProperty(BIBLIO_ID);
            while (n.hasNext()){
                tempModel.add(kohaAdapter.getBiblio(n.next().toString()));
            }
            SPARQLQueryBuilder sqb = new SPARQLQueryBuilder(baseURI);
            Query query = sqb.getItemsFromModelQuery(subjectsIterator.next().toString());
            QueryExecution qexec = QueryExecutionFactory.create(query, tempModel);
            Model itemsModel = qexec.execConstruct();

            allItemsModel.add(itemsModel);
        }

        return allItemsModel;
    }

	@Override
	public String createWork(String work) {
		return repository.createWork(work);
	}

    @Override
    public void deleteWork(Model work) {
        repository.delete(work);
    }

    @Override
    public Model patchWork(String workId, String requestBody) throws Exception {
        PatchParser patchParser = new PatchParser();
        try {
            patchParser.setPatchData(requestBody);
        } catch (Exception e) {
            throw new PatchParserException("Bad request");
        }
        List<PatchObject> patch = patchParser.parsePatch();
        List<Patch> patches = new ArrayList<Patch>();
        Iterator<PatchObject> iter = patch.iterator();
        while (iter.hasNext()) {
            patches.add(iter.next().toPatch());
        }
        repository.patch(patches);
        return retrieveWorkById(workId);
    }
}
