import http.server
import socketserver
import os

PORT = 8080
DIRECTORY = "dist3"

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        # Resolve clean directory URLs to index.html
        path = self.translate_path(self.path)
        if os.path.isdir(path):
            index_path = os.path.join(path, "index.html")
            if os.path.exists(index_path):
                self.path = os.path.join(self.path, "index.html")
        return super().do_GET()

if __name__ == '__main__':
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Serving {DIRECTORY} cleanly on http://localhost:{PORT}")
        httpd.serve_forever()
