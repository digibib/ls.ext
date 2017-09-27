package no.deichman.services.entity.external;

import com.google.common.collect.ImmutableMap;

import java.util.Map;

/**
 * Responsibility: provide a maping for MARC roles to rdf.
 */
public final class Role {
    private Role() {
    }

    private static final Map<String, String> ROLE_MAP = ImmutableMap.<String, String>builder()
            .put("arr", "musicalArranger")
            .put("bearb", "adaptor")
            .put("bikort", "contributor")
            .put("billedred", "contributor")
            .put("biogr", "biographed")
            .put("dir", "conductor")
            .put("dirigent", "conductor")
            .put("eks", "performer")
            .put("f", "contributor")
            .put("fest", "biographed")
            .put("forf", "author")
            .put("forfanal", "contributor")
            .put("forft", "contributor")
            .put("fort", "reader")
            .put("forord", "contributor")
            .put("foto", "photographer")
            .put("fotog", "photographer")
            .put("fotogr", "photographer")
            .put("gjendikt", "translator")
            .put("illus", "illustrator")
            .put("illustr", "illustrator")
            .put("illustrt", "illustrator")
            .put("illustratør", "illustrator")
            .put("ill", "illustrator")
            .put("innl", "reader")
            .put("k", "composer")
            .put("komm", "reader")
            .put("komp", "composer")
            .put("koreogr", "coreographer")
            .put("manusforf", "scriptWriter")
            .put("medarb", "contributor")
            .put("medf", "author")
            .put("medforf", "author")
            .put("medforfatter", "author")
            .put("medred", "editor")
            .put("medutg", "publisher")
            .put("oppl", "reader")
            .put("opprforf", "contributor")
            .put("overs", "translator")
            .put("oversetter", "translator")
            .put("red", "editor")
            .put("redaktør", "editor")
            .put("reg", "director")
            .put("regissør", "director")
            .put("regt", "director")
            .put("s", "contributor")
            .put("sang", "performer")
            .put("skuesp", "actor")
            .put("t", "lyricist")
            .put("tekstf", "lyricist")
            .put("tekstforf", "lyricist")
            .put("utg", "publisher")
            .put("u", "performer")
            .put("utøv", "performer")
            .build();

    public static String translate(String fromMarcRole) {
        return ROLE_MAP.getOrDefault(fromMarcRole, "contributor");
    }

}
