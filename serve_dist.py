import http.server
import os
import sys

PORT = 8080
DIRECTORY = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dist')

class SPAMapHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        path = self.translate_path(self.path)
        if not os.path.exists(path) or os.path.isdir(path):
            if os.path.isdir(path) and os.path.exists(os.path.join(path, 'index.html')):
                return super().do_GET()
            
            parts = [p for p in self.path.split('/') if p]
            if parts and parts[0] in ['uk', 'ca', 'au', 'nz', 'zh', 'ru']:
                self.path = f'/{parts[0]}/index.html'
            else:
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
