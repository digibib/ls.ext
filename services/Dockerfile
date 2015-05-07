FROM java:8
ADD ./build/libs/services-1.0-SNAPSHOT-standalone.jar /services/
WORKDIR /services
CMD java \
    -DKOHA_URL="$KOHA_URL" \
    -DKOHA_USER="$KOHA_USER" \
    -DKOHA_PASSWORD="$KOHA_PASSWORD" \
    -DFUSEKI_URL="$FUSEKI_URL" \
    -jar /services/services-1.0-SNAPSHOT-standalone.jar
