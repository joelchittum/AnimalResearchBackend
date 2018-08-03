import random,string

import os
import os.path

import cherrypy
from cherrypy.lib import static

localDir = os.path.dirname(__file__)
absDir = os.path.join(os.getcwd(), localDir)

class datauploader():
    @cherrypy.expose
    def index(self):
        return """
        <html><body>
            <h2>Upload a file</h2>
            <form action="upload" method="post" enctype="multipart/form-data">
            filename: <input type="file" name="myFile" /><br />
            <input type="submit" />
            </form>
            <h2>Download a file</h2>
            <a href='download'>This one</a>
        </body></html>
        """

    @cherrypy.expose
    def upload(self, myFile):
        out = """<html>
        <body>
            myFile length: %s<br />
            myFile filename: %s<br />
            myFile mime-type: %s
        </body>
        </html>"""

        # Although this just counts the file length, it demonstrates
        # how to read large files in chunks instead of all at once.
        # CherryPy reads the uploaded file into a temporary file;
        # myFile.file.read reads from that.
        size = 0
        whole_data = bytearray() # Neues Bytearray
        while True:
            data = myFile.file.read(8192)
            whole_data += data # Save data chunks in ByteArray whole_data

            if not data:
                break
            size += len(data)

            written_file = open(myFile.filename, "wb") # open file in write bytes mode
            written_file.write(whole_data) # write file

        return out % (size, myFile.filename, myFile.content_type)
    upload.exposed = True

    @cherrypy.expose
    def download(self):
        path = os.path.join(absDir, 'pdf_file.pdf')
        return static.serve_file(path, 'application/x-download', 'attachment', os.path.basename(path))

    @cherrypy.expose
    def shp2geojson(self, ufile):
        while True:
            data = ufile.file.read(8192)
            if not data:
                break
            size += len(data)

config = os.path.join('/', 'config.conf')

if __name__ == '__main__':
    cherrypy.quickstart(datauploader(), '/',  config)
