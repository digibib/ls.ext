package no.deichman.services.entity.external;

import com.google.gson.annotations.SerializedName;
import org.apache.jena.vocabulary.RDF;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static com.google.common.collect.ImmutableMap.of;

/**
 * Responsibility: create a basic person object.
 */
@SuppressWarnings("checkstyle:DesignForExtension")
public class Person extends Named {

    @SerializedName("deichman:birthYear")
    private String birthYear;

    @SerializedName("deichman:deathYear")
    private String deathYear;

    @SerializedName("deichman:nationality")
    private List<Map<String, String>> nationality;

    @SerializedName("deichman:ordinal")
    private String ordinal;

    public Person(String id, String name) {
        setType("deichman:Person");
        setId(id);
        setName(name);
    }

    Person() {
    }

    @Override
    protected void assignType() {
        setType("deichman:Person");
    }

    Person(String id, String name, String dates, String nationality) {
        this(id, name);
        setDates(dates);
        ExternalDataObject nationality1 = new ExternalDataObject();
        nationality1.setId(nationality);
        addNationality(nationality1);
    }

    final Map<String, String> getPersonMap() {
        Map<String, String> personMap = new HashMap<>();
        personMap.put(RDF.type.getURI(), "http://deichman.no/ontology#Person");
        String baseURI = "http://deichman.no/ontology#";
        personMap.put(baseURI + "name", getName());
        personMap.put(baseURI + "birthYear", getBirthYear());
        personMap.put(baseURI + "deatYear", getDeathYear());
        return personMap;
    }

    final void setDates(String dates) {
        List<String> dateList = Arrays.asList(dates.split("-"));
        Collections.sort(dateList);

        if (dateList.size() > 0) {
            Optional.ofNullable(dateList.get(0)).ifPresent(this::setBirthYear);
        }
        if (dateList.size() > 1) {
            Optional.ofNullable(dateList.get(1)).ifPresent(this::setDeathYear);
        }
    }

    public final String getBirthYear() {
        return birthYear;
    }

    public final void setBirthYear(String birthYear) {
        this.birthYear = birthYear;
    }

    public final String getDeathYear() {
        return deathYear;
    }

    public final void setDeathYear(String deathYear) {
        this.deathYear = deathYear;
    }

    public final void addNationality(ExternalDataObject nationality) {
        if (this.nationality == null) {
            this.nationality = new ArrayList<>();
        }
        this.nationality.add(of("@id", nationality.getId()));
    }

    public final void setOrdinal(String ordinal) {
        this.ordinal = ordinal;
    }
}
