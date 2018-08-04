FROM oscarfonts/geoserver:latest

RUN apt-get update && \
  apt-get upgrade

COPY /resources/plugins/*.jar /usr/local/geoserver/WEB-INF/lib/
