FROM java:8
ADD ./build/libs/services-1.0-SNAPSHOT-standalone.jar /services/
WORKDIR /services
CMD java \
    -DKOHA_PORT="$KOHA_PORT" \
    -DKOHA_USER="$KOHA_USER" \
    -DKOHA_PASSWORD="$KOHA_PASSWORD" \
    -DFUSEKI_PORT="$FUSEKI_PORT" \
    -jar /services/services-1.0-SNAPSHOT-standalone.jar
