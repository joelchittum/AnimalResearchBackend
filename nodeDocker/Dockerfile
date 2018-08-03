FROM node:8-alpine

RUN apk update && \
apk add \
python \
make \
g++

WORKDIR /server
COPY source/package*.json ./

RUN npm install

COPY source/ .

CMD npm start

