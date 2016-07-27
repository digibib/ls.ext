package no.deichman.services.entity.patch;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonParseException;
import com.google.gson.reflect.TypeToken;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.RDFNode;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdf.model.Statement;
import org.apache.jena.vocabulary.XSD;

import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static com.google.common.collect.ImmutableMap.of;
import static com.google.common.collect.Maps.newHashMap;
import static org.apache.jena.rdf.model.ResourceFactory.createResource;

/**
 * Responsibility: TODO.
 */
public final class PatchParser {

    private String patchInput;
    private List<PatchObject> rawParseObject = new ArrayList<>();
    private static final Type PATCH_OBJECT_LIST_TYPE = new TypeToken<List<PatchObject>>() {
    }.getType();

    /**
     * Responsibility: keep track of anonymous resource uris and map them as blank nodes.
     */
    static final class UriRegistry {
        private Map<String, Integer> blankNodeDictionary = new LinkedHashMap<>();

        String getInternalReferencableUri(Resource resource) {
            String resourceUri;
            if (resource.isAnon()) {
                String nodeId = resource.getId().getBlankNodeId().toString();
                Integer blankNodeIndex = blankNodeDictionary.get(nodeId);
                if (blankNodeIndex == null) {
                    blankNodeIndex = blankNodeDictionary.size();
                    blankNodeDictionary.put(nodeId, blankNodeIndex);
                }
                resourceUri = "_:b" + blankNodeIndex;
            } else {
                resourceUri = resource.getURI();
            }
            return resourceUri;
        }
    }

    PatchParser(String input) {
        setPatchData(input);
    }

    PatchParser() {
    }

    public static List<Patch> createDeleteModelAsPatches(Model model) throws PatchParserException {
        UriRegistry uriRegistry = new UriRegistry();
        List<PatchObject> patchObjects = new ArrayList<>();
        for (Statement statement : model.listStatements().toList()) {
            PatchObject patchObject = new PatchObject();
            patchObject.setOperation("del");
            Resource subject = statement.getSubject();
            String subjectUri = uriRegistry.getInternalReferencableUri(subject);
            patchObject.setSubject(subjectUri);
            patchObject.setPredicate(statement.getPredicate().getURI());
            if (statement.getObject().isURIResource() || statement.getObject().isAnon()) {
                patchObject.setObject(of("type", XSD.anyURI.getURI(), "value", uriRegistry.getInternalReferencableUri(statement.getObject().asResource())));
            } else {
                patchObject.setObject(of("type", statement.getObject().asLiteral().getDatatypeURI(), "value", statement.getObject().asLiteral().getString()));
            }
            patchObjects.add(patchObject);
        }
        return createPatches(patchObjects);
    }


    public static List<Patch> parse(String ldPatchJson) throws PatchParserException {
        PatchParser patchParser = new PatchParser();
        patchParser.setPatchData(ldPatchJson);
        List<PatchObject> patchObjects = patchParser.parsePatch();
        List<Patch> patches = createPatches(patchObjects);
        return patches;
    }

    public static List<Patch> createPatches(List<PatchObject> patch) throws PatchParserException {
        List<Patch> patches = new ArrayList<>();
        Map<String, RDFNode> blankNodes = newHashMap();
        for (PatchObject patchObject : patch) {
            if (PatchObject.isBlankNodeUri(patchObject.getSubject())) {
                if (PatchObject.isBlankNodeUri(patchObject.getObjectValue()) && patchObject.getObjectDatatype().equals(XSD.anyURI)) {
                    throw new PatchParserException("Patch contained blank node as subject and object: "
                            + patchObject.getSubject() + " " + patchObject.getPredicate() + " " + patchObject.getObjectValue());
                }
                Resource anonymousResource = createResource();
                blankNodes.put(patchObject.getSubject(), anonymousResource);
            }
        }
        for (PatchObject aPatch : patch) {
            patches.add(aPatch.toPatch(blankNodes));
        }
        return patches;
    }

    List<PatchObject> parsePatch() throws PatchParserException {
        Gson gson = new GsonBuilder()
                .registerTypeAdapter(PATCH_OBJECT_LIST_TYPE, new PatchObjectTypeAdapter())
                .create();
        List<PatchObject> rawPatches;
        try {
            rawPatches = gson.fromJson(patchInput, PATCH_OBJECT_LIST_TYPE);
        } catch (JsonParseException jpe) {
            throw new PatchParserException("Error parsing patch" + patchInput, jpe);
        }
        rawParseObject.addAll(rawPatches);
        return rawPatches;
    }

    void setPatchData(String input) {
        patchInput = input;
    }

    String getPatchInput() {
        return patchInput;
    }

    List<PatchObject> getRawPatchObject() {
        return rawParseObject;
    }
}
