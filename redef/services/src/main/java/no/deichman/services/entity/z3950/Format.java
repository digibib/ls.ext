package no.deichman.services.entity.z3950;

import com.google.common.collect.ImmutableMap;

import java.util.Map;

/**
 * Responsibility: map format codes to rdf.
 */
public final class Format {
    private Format() {
    }

    private static final Map<String, String> FORMAT_MAP = ImmutableMap.<String, String>builder()
            .put("a", "Map")
            .put("da", "Gramophone_record")
            .put("db", "Compact_Cassette")
            .put("dc", "Compact_Disc")
            .put("dd", "Digi_book")
            .put("de", "Digi_card")
            .put("dz", "MP3-CD")
            .put("ed", "Videotape")
            .put("ee", "DVD")
            .put("ef", "Blu-ray")
            .put("eg", "3D_movie")
            .put("fd", "Diapositive")
            .put("fm", "Poster")
            .put("gc", "DVD-ROM")
            .put("gd", "CD-ROM")
            .put("gt", "DAISY")
            .put("ib", "Microfilm_reel")
            .put("ic", "Microfiche")
            .put("ma", "Personal_computer_game")
            .put("mb", "Playstation_2_game")
            .put("mc", "Playstation_3_game")
            .put("me", "Playstation_4_game")
            .put("mj", "Xbox_360_game")
            .put("mk", "Xbox_One_game")
            .put("mn", "Nintendo_DS_game")
            .put("mo", "Nintendo_Wii_game")
            .put("na", "E-book")
            .put("nb", "E-book")
            .build();

    public static String translate(String formatCode) {
        return FORMAT_MAP.get(formatCode);
    }
}
