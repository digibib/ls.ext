package no.deichman.services.ontology;

import com.google.gson.Gson;
import no.deichman.services.entity.EntityResource;
import no.deichman.services.entity.repository.RDFRepository;
import org.apache.jena.query.QueryExecution;
import org.apache.jena.query.QueryExecutionFactory;
import org.apache.jena.query.ResultSet;
import org.apache.jena.rdf.model.Model;

import javax.inject.Singleton;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.HashMap;
import java.util.Map;

/**
 * Responsibility: Return translated strings.
 */
@Singleton
@Path("translations")
public class TranslationResource {
    private String[] locales = {"no", "en"};
    private Map<String, String> cachedTranslations = new HashMap<>();
    private String query = ""
            + "select ?a ?b where { \n"
            + "   ?a <http://www.w3.org/2000/01/rdf-schema#label> ?b ;\n"
            + "   filter(lang(?b) = '__LOCALE__')\n"
            + "}";

    public TranslationResource() {
        EntityResource res = new EntityResource();
        initCachedTranslations(res.getEntityService().getRepo());
    }

    public TranslationResource(RDFRepository repo) {
        initCachedTranslations(repo);
    }

    private void initCachedTranslations(RDFRepository repo) {
        Model model = repo.retrieveTranslationResources();
        for (String locale : locales) {
            Map<String, String> translations = new HashMap<>();
            QueryExecution qe = QueryExecutionFactory.create(query.replace("__LOCALE__", locale), model);
            ResultSet resultSet = qe.execSelect();
            resultSet.forEachRemaining((result) -> {
                // we are trimming the prefix 'file:///' from URIs, since Jena automaically adds it when URI schema is missing.
                translations.put(result.getResource("a").toString().replaceFirst("http://server/unset-base/", ""), result.getLiteral("b").getString());
            });
            cachedTranslations.put(locale, new Gson().toJson(translations));
        }
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON + ";charset=utf-8")
    @Path("{locale}")
    public final Response getTranslations(@PathParam("locale") String locale) {
        return Response.ok().entity(cachedTranslations.get(locale)).build();
    }
}
