package no.deichman.services.entity.patch;

public class PatchParserException extends Exception {
    public PatchParserException(String message){
        super(message);
    }

    public PatchParserException(Throwable cause) {
        super(cause);
    }

    public PatchParserException(String message, Throwable cause) {
        super(message, cause);
    }
}
