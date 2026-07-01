# Kerocket / CampusLinkProject — build from repo root (CampusLinkBackend + CampusLinkFrontend).
# Do NOT follow Nixpacks advice to flatten folders; this Dockerfile needs both subfolders.

FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /build

COPY CampusLinkBackend/pom.xml CampusLinkBackend/pom.xml
COPY CampusLinkBackend/src CampusLinkBackend/src
COPY CampusLinkFrontend/campuslink-frontend CampusLinkFrontend/campuslink-frontend

WORKDIR /build/CampusLinkBackend
RUN mvn -B -DskipTests -Pwith-frontend package

FROM tomcat:9.0-jre17-temurin

RUN rm -rf /usr/local/tomcat/webapps/*

COPY --from=build /build/CampusLinkBackend/target/s70820.war /usr/local/tomcat/webapps/ROOT.war

COPY CampusLinkBackend/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN sed -i 's/\r$//' /usr/local/bin/docker-entrypoint.sh \
    && chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 8080

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["catalina.sh", "run"]
