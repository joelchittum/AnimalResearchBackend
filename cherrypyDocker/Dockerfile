FROM python:alpine3.6

RUN pip install --upgrade pip && \
  pip install cherrypy && \
  pip install requests

WORKDIR /animalResearch

COPY /cherrypyFiles/* /
CMD python ./DataUploader.py
