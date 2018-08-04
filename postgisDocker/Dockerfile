FROM postgres:10

ENV POSTGIS_MAJOR 2.4
ENV POSTGIS_VERSION 2.4.3+dfsg-2.pgdg90+1

RUN apt-get update && \
  apt-get upgrade -y && \
  apt-get install -y perl fonts-dejavu-core fontconfig-config libaec0 && \
  apt-get install -y libquadmath0 libgfortran3 libblas-common && \
  apt-get install -y libblas3 liblapack3 libarpack2 libarmadillo7 && \
  apt-get install -y libnghttp2-14 librtmp1 libssh2-1 libdap23 && \
  apt-get install -y libdapclient6v5 libdapserver7v5 libepsilon1 && \
  apt-get install -y libpng16-16 libfreetype6 libfontconfig1 && \
  apt-get install -y libfreexl1 libgeos-3.5.1 libgeos-c1v5 && \
  apt-get install -y proj-data libproj12 libjbig0 libjpeg62-turbo && \
  apt-get install -y libgeotiff2 libgif7 libhdf4-0-alt libsz2 && \
  apt-get install -y libhdf5-100 libjson-c3 libminizip1 && \
  apt-get install -y libkmlbase1 libkmldom1 libkmlengine1 libkmlconvenience1 && \
  apt-get install -y libkmlregionator1 libkmlxsd1 libnetcdf11 libodbc1 && \
  apt-get install -y libogdi3.2 libopenjp2-7 liblcms2-2 libnspr4 libnss3

RUN apt-get install -y --no-install-recommends \
  postgresql-$PG_MAJOR-postgis-$POSTGIS_MAJOR=$POSTGIS_VERSION \
  postgresql-$PG_MAJOR-postgis-$POSTGIS_MAJOR-scripts=$POSTGIS_VERSION \
  postgis=$POSTGIS_VERSION \
  && rm -rf /var/lib/apt/lists/*
