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
            .put("ab", "Map")
            .put("da", "GramophoneRecord")
            .put("db", "CompactCassette")
            .put("dc", "CompactDisc")
            .put("dd", "DigiBook")
            .put("de", "DigiCard")
            .put("dz", "MP3-CD")
            .put("ed", "Videotape")
            .put("ee", "DVD")
            .put("ef", "Blu-ray")
            .put("eg", "3DMovie")
            .put("fd", "Diapositive")
            .put("gc", "DVD-ROM")
            .put("gd", "CD-ROM")
            .put("gt", "DAISY")
            .put("ma", "PersonalComputerGame")
            .put("mb", "Playstation2Game")
            .put("mc", "Playstation3Game")
            .put("me", "Playstation4Game")
            .put("mj", "Xbox360Game")
            .put("mk", "XboxOneGame")
            .put("mn", "NintendoDSGame")
            .put("mo", "NintendoWiiGame")
            .put("mp", "NintendoWiiUGame")
            .put("ms", "NintendoSwitchGame")
            .put("na", "PDF")
            .put("nb", "EPUB")
            .build();

    public static String translate(String formatCode) {
        return FORMAT_MAP.get(formatCode);
    }
}
