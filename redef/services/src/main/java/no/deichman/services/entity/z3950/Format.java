package no.deichman.services.entity.z3950;

import com.google.common.collect.ImmutableMap;

import java.util.Map;

/**
 * Responsibility: map format codes to rdf
 */
public final class Format {
    private Format() {
    }

    private static final Map<String, String> FORMAT_MAP = ImmutableMap.<String, String>builder()
            .put("a", "Map")
            .put("ab", "Map")
            .put("c", "Sheet_music")
            .put("da", "Gramophone_record")
            .put("db", "Compact_Cassette")
            .put("dc", "Compact_Disc")
            .put("dd", "Digi_book")
            .put("de", "Digi_card")
            .put("dg", "Music_recording")
            .put("dh", "Language_course")
            .put("di", "Audiobook")
            .put("dj", "Audiobook")
            .put("dl", "Super_Audio_CD")
            .put("dm", "DVD-Audio")
            .put("dn", "Blu-ray_Audio")
            .put("dz", "MP3")
            .put("ed", "Videotape")
            .put("ee", "DVD")
            .put("ef", "Blu-ray_Disk")
            .put("fd", "Diapositive")
            .put("fm", "Poster")
            .put("ga", "E-book")
            .put("gc", "DVD-ROM")
            .put("gd", "CD-ROM")
            .put("ge", "Web_page")
            .put("gg", "Blu-ray_ROM")
            .put("gt", "DAISY")
            .put("h", "Physical_body")
            .put("ib", "Microfilm_reel")
            .put("ic", "Microfiche")
            .put("j", "Periodical")
            .put("l", "Book")
            .put("la", "E-book")
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
            .put("o", "E-book")
            .put("sm", "Periodical")
            .put("vo", "File_folder")
            .build();

    public final static String translate(String formatCode) {
        return FORMAT_MAP.get(formatCode);
    }
}
