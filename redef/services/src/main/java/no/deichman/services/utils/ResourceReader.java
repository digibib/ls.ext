package no.deichman.services.utils;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.stream.Collectors;

/**
 * Responsibility: Read resources as strings.
 */
public class ResourceReader {
    public final String readFile(String filename) {
        try (BufferedReader queryBuffer = new BufferedReader(new InputStreamReader(this.getClass().getClassLoader().getResourceAsStream(filename)));) {
            return queryBuffer.lines().collect(Collectors.joining("\n"));
        } catch (IOException | NullPointerException e) {
            throw new RuntimeException("Could not load file: " + filename, e);
        }
    }
}
