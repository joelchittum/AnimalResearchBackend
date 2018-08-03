FROM python:alpine3.6

RUN pip install --upgrade pip && \
pip install cherrypy && \
pip install requests

COPY /cherrypy/* /
CMD python ./DataUploader.py

