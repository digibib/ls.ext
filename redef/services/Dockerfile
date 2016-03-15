FROM java:8
ADD javarunner.sh /javarunner.sh

ADD build/libs/services-1.0-SNAPSHOT-standalone.jar /services-1.0-SNAPSHOT-standalone.jar

CMD /javarunner.sh \
    -DKOHA_PORT="$KOHA_PORT" \
    -DKOHA_USER="$KOHA_USER" \
    -DKOHA_PASSWORD="$KOHA_PASSWORD" \
    -DTRIPLESTORE_PORT="$TRIPLESTORE_PORT" \
    -DDATA_BASEURI="$DATA_BASEURI" \
    -DELASTICSEARCH_URL="$ELASTICSEARCH_URL" \
    -Done-jar.silent=true \
    -agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=5070 \
    -jar /services-1.0-SNAPSHOT-standalone.jar
