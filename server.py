import http.server
import urllib.request
import urllib.error
import json
import os
import ssl

PORT = 8080
SERVICE_DOMAIN = 'zrh64qgjux'
API_KEY = 'D5MVefBEnJSxJbEe3KStdf3kOTHw37WZnqwW'
MICROCMS_BASE = f'https://{SERVICE_DOMAIN}.microcms.io/api/v1'
SSL_CONTEXT = ssl.create_default_context()


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=os.path.dirname(os.path.abspath(__file__)), **kwargs)

    def do_GET(self):
        if self.path.startswith('/api/'):
            self.proxy_microcms()
        else:
            super().do_GET()

    def proxy_microcms(self):
        api_path = self.path[len('/api/'):]
        target_url = f'{MICROCMS_BASE}/{api_path}'

        req = urllib.request.Request(target_url)
        req.add_header('X-MICROCMS-API-KEY', API_KEY)

        try:
            with urllib.request.urlopen(req, context=SSL_CONTEXT) as resp:
                body = resp.read()
                self.send_response(resp.status)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(body)
        except urllib.error.HTTPError as e:
            error_body = e.read()
            print(f'[microCMS] HTTP {e.code}: {target_url}')
            self.send_response(e.code)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(error_body)
        except Exception as e:
            print(f'[microCMS] Error: {type(e).__name__}: {e}')
            self.send_response(502)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            msg = json.dumps({'message': f'microCMSへの接続に失敗しました: {e}'})
            self.wfile.write(msg.encode())


if __name__ == '__main__':
    print(f'Serving at http://localhost:{PORT}')
    print('microCMS proxy: /api/{{endpoint}}')
    http.server.HTTPServer(('', PORT), Handler).serve_forever()
