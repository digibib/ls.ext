FROM java:openjdk-8-jdk as builder

ENV GRADLE_VERSION 3.4.1

WORKDIR /usr/bin
RUN curl -sLO https://services.gradle.org/distributions/gradle-${GRADLE_VERSION}-all.zip && \
  unzip gradle-${GRADLE_VERSION}-all.zip > /dev/null && \
  ln -s gradle-${GRADLE_VERSION} gradle && \
  rm gradle-${GRADLE_VERSION}-all.zip

ENV GRADLE_HOME /usr/bin/gradle
ENV PATH $PATH:$GRADLE_HOME/bin

COPY ./build.gradle /services/build.gradle
COPY ./settings.gradle /services/settings.gradle

WORKDIR /services

RUN gradle dependencies

COPY ./src /services/src
COPY ./config /services/config

RUN gradle --no-daemon -x test build oneJar



FROM java:8

COPY --from=builder /services/build/libs/services-1.0-SNAPSHOT-standalone.jar /services-1.0-SNAPSHOT-standalone.jar

ADD entrypoint.dev.sh /entrypoint.sh

CMD /entrypoint.sh \
    -Done-jar.silent=true \
    -agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=5070 \
    -jar /services-1.0-SNAPSHOT-standalone.jar
