package no.deichman.services.ontology;

import com.google.gson.Gson;
import no.deichman.services.rdf.RDFModelUtil;
import org.apache.jena.query.QueryExecution;
import org.apache.jena.query.QueryExecutionFactory;
import org.apache.jena.query.ResultSet;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.riot.Lang;

import javax.inject.Singleton;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Responsibility: Return translated strings.
 */
@Singleton
@Path("translations")
public class TranslationResource {
    private String[] inputFiles = {"format.ttl", "language.ttl", "audience.ttl", "nationality.ttl"};
    private String[] locales = {"no", "en"};
    private Map<String, String> cachedTranslations = new HashMap<>();
    private String query = ""
            + "select ?a ?b where { \n"
            + "   ?a <http://www.w3.org/2000/01/rdf-schema#label> ?b ;\n"
            + "   filter(lang(?b) = '__LOCALE__')\n"
            + "}";

    public TranslationResource() {
        Model model = ModelFactory.createDefaultModel();
        for (String translateableFile : inputFiles) {
            try (BufferedReader queryBuffer = new BufferedReader(new InputStreamReader(this.getClass().getClassLoader().getResourceAsStream(translateableFile)));) {
                String temp = queryBuffer.lines().collect(Collectors.joining("\n"));
                model.add(RDFModelUtil.modelFrom(temp, Lang.TURTLE));
            } catch (IOException | NullPointerException e) {
                throw new RuntimeException("Could not load ttl file: " + translateableFile, e);
            }
        }
        for (String locale : locales) {
            Map<String, String> translations = new HashMap<>();
            QueryExecution qe = QueryExecutionFactory.create(query.replace("__LOCALE__", locale), model);
            ResultSet resultSet = qe.execSelect();
            resultSet.forEachRemaining((result) -> {
                translations.put(result.getResource("a").toString(), result.getLiteral("b").getString());
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
