FROM java:8
ADD ./target/services-1.0-SNAPSHOT.jar /services/
WORKDIR /services
ENTRYPOINT ["java", "-jar", "/services/services-1.0-SNAPSHOT.jar"]
CMD [""]