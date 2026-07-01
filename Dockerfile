# Kerocket / CampusLinkProject — build from repo root (CampusLinkBackend + CampusLinkFrontend).
# Do NOT follow Nixpacks advice to flatten folders; this Dockerfile needs both subfolders.

FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /build

COPY CampusLinkBackend/pom.xml CampusLinkBackend/pom.xml
COPY CampusLinkBackend/src CampusLinkBackend/src
COPY CampusLinkFrontend/campuslink-frontend CampusLinkFrontend/campuslink-frontend

# React must call same-origin /api on Kerocket (not localhost from committed .env files).
RUN printf "PUBLIC_URL=\nREACT_APP_API_URL=\n" > /build/CampusLinkFrontend/campuslink-frontend/.env.production.local

WORKDIR /build/CampusLinkBackend
RUN mvn -B -DskipTests -Pwith-frontend package

FROM tomcat:9.0-jre17-temurin

RUN rm -rf /usr/local/tomcat/webapps/*

COPY --from=build /build/CampusLinkBackend/target/s70820.war /tmp/ROOT.war
# Exploded WAR starts faster on Kerocket (avoids unpack timeout / Cloudflare 524 on cold start).
RUN mkdir -p /usr/local/tomcat/webapps/ROOT \
    && cd /usr/local/tomcat/webapps/ROOT \
    && jar -xf /tmp/ROOT.war \
    && rm /tmp/ROOT.war

COPY CampusLinkBackend/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN sed -i 's/\r$//' /usr/local/bin/docker-entrypoint.sh \
    && chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 8080

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["catalina.sh", "run"]
