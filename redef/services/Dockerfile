FROM java:8
ADD javarunner.sh /services/
ADD ./build/libs/services-1.0-SNAPSHOT-standalone.jar /services/
WORKDIR /services
CMD /services/javarunner.sh \
    -DKOHA_PORT="$KOHA_PORT" \
    -DKOHA_USER="$KOHA_USER" \
    -DKOHA_PASSWORD="$KOHA_PASSWORD" \
    -DFUSEKI_PORT="$FUSEKI_PORT" \
    -DDATA_BASEURI="$DATA_BASEURI" \
    -Done-jar.silent=true \
    -jar \
    /services/services-1.0-SNAPSHOT-standalone.jar
