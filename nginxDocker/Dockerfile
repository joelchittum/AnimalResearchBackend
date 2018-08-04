FROM nginx:alpine

RUN apk update && \
  apk add iputils

RUN mkdir /ui
RUN rm /etc/nginx/conf.d/default.conf

COPY research.conf /etc/nginx/conf.d/research.conf
