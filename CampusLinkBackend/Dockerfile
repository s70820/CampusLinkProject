# CampusLink+ on Kerocket (Tomcat 9 + javax — matches Spring Boot 2.5).
# Build context must be the parent `fyp` folder so React can be bundled:
#   docker build -f CampusLinkBackend/Dockerfile -t campuslink ..
#
# API-only (no React in WAR): build from CampusLinkBackend only:
#   docker build -t campuslink .

FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /build

# Monorepo layout (recommended): fyp/CampusLinkBackend + fyp/CampusLinkFrontend
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
