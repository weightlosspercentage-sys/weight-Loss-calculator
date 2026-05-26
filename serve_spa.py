import http.server
import os
import sys

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class SPAMapHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        # Clean path and check if the file exists on disk
        path = self.translate_path(self.path)
        # If the requested path is not an existing file on disk, fallback to index.html
        if not os.path.exists(path) or os.path.isdir(path):
            # Check if there is an index.html in the directory first (default behavior)
            if os.path.isdir(path) and os.path.exists(os.path.join(path, 'index.html')):
                return super().do_GET()
            self.path = '/index.html'
        return super().do_GET()

if __name__ == '__main__':
    os.chdir(DIRECTORY)
    server_address = ('', PORT)
    httpd = http.server.HTTPServer(server_address, SPAMapHandler)
    print(f"Serving SPA from {DIRECTORY} on port {PORT} (http://localhost:{PORT})...")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server.")
        sys.exit(0)
