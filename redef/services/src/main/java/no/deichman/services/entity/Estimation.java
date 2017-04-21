package no.deichman.services.entity;

import com.google.gson.annotations.Expose;
import com.google.gson.annotations.SerializedName;

/**
 * Responsibility: hold estimation data.
 */
public final class Estimation {
    @Expose
    @SerializedName("pending")
    private boolean pending;
    @Expose
    @SerializedName("estimate")
    private int estimate;
    @Expose
    @SerializedName("error")
    private String error;

    public void setEstimatedWait(int estimatedWait) {
        this.estimate = estimatedWait;
    }

    public int getEstimatedWait() {
        return estimate;
    }

    public boolean isPending() {
        return pending;
    }

    public void setPending(boolean pending) {
        this.pending = pending;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }
}
