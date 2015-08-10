package no.deichman.services.testutil;

import java.io.IOException;
import java.net.ServerSocket;

/**
 * Responsibility: Pick a local, currently unused, port.
 */
public final class PortSelector {

    private PortSelector() { }

    public static int randomFree() {
        try (ServerSocket socket = new ServerSocket(0)) {
            return socket.getLocalPort();
        } catch (IOException e) {
            throw new IllegalStateException("Failed to pick a random, free, local port.", e);
        }
    }
}
