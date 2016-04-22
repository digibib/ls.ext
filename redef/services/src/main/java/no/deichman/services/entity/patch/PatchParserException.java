package no.deichman.services.entity.patch;

public class PatchParserException extends Exception {
    PatchParserException(String message){
        super(message);
    }

    PatchParserException(String message, Throwable cause) {
        super(message, cause);
    }
}
