FROM java:8

ADD build/libs/services-1.0-SNAPSHOT-standalone.jar /services-1.0-SNAPSHOT-standalone.jar

ADD entrypoint.sh /entrypoint.sh

CMD /entrypoint.sh \
    -DKOHA_API_USER="$KOHA_API_USER" \
    -DKOHA_API_PASS="$KOHA_API_PASS" \
    -Done-jar.silent=true \
    -agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=5070 \
    -jar /services-1.0-SNAPSHOT-standalone.jar
