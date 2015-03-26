FROM java:8
ADD ./build/libs/services-1.0-SNAPSHOT-standalone.jar /services/
WORKDIR /services
ENTRYPOINT ["java", "-jar", "/services/services-1.0-SNAPSHOT-standalone.jar"]
CMD [""]