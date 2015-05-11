package no.deichman.services.service;

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
import no.deichman.services.kohaadapter.KohaAdapter;
import no.deichman.services.kohaadapter.KohaAdapterDefault;
import no.deichman.services.repository.Repository;
import no.deichman.services.repository.RepositoryDefault;

public class ServiceDefault implements Service {

    private Repository repository = new RepositoryDefault();
    private KohaAdapter kohaAdapter = new KohaAdapterDefault();
    public static final Property BIBLIO_ID = ResourceFactory.createProperty("http://deichman.no/ontology#biblioId");

    @Override
    public Model retriveWorkById(String id) {

        Model m = ModelFactory.createDefaultModel();
        m.add(repository.retrieveWorkById(id));

        return m;
    }

    public void setRepository(Repository repository) {
        this.repository = repository;
    }

    public void setKohaAdapter(KohaAdapter kohaAdapter) {
        this.kohaAdapter = kohaAdapter;
    }

    @Override
    public Model listWork() {
        return repository.listWork();
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

            Query query = SPARQLQueryBuilder.getItemsFromModelQuery(subjectsIterator.next().toString());
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
}
