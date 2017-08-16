FROM java:9

ADD build/libs/services-1.0-SNAPSHOT-standalone.jar /services-1.0-SNAPSHOT-standalone.jar

ADD entrypoint.sh /entrypoint.sh

CMD /entrypoint.sh \
    -Done-jar.silent=true \
    -agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=5070 \
    -jar /services-1.0-SNAPSHOT-standalone.jar
