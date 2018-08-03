FROM nginx:alpine

RUN apk update && apk upgrade
RUN mkdir /uicode
COPY GeocubeTwo /uicode/
RUN rm /etc/nginx/conf.d/default.conf

COPY research.conf /etc/nginx/conf.d/research.conf

COPY entrypoint.sh /usr/bin/
RUN apk add iputils
ENTRYPOINT ["/usr/bin/entrypoint.sh"]
