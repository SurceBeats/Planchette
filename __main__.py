#!/usr/bin/env python3
"""
Planchette Talking Board — entry point
Run: python . (or python __main__.py)
"""

import os
import sys
import asyncio

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from pymodules.config import ensure_config
from pymodules.planchette_app import create_app
from pymodules.intro import show_banner
from pymodules.ssl import ssl_enabled, get_ssl_cert_info

CONFIG_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "planchette.ini")

cfg = ensure_config(CONFIG_PATH)

app = create_app(cfg, CONFIG_PATH)

if __name__ == "__main__":
    host = cfg.get("server", "host", fallback="0.0.0.0")
    port = cfg.getint("server", "port", fallback=5000)
    run_mode = cfg.get("server", "run_mode", fallback="PROD")
    ssl_active = ssl_enabled()

    show_banner(host, port, run_mode, ssl_active)

    if ssl_active:
        ssl_dir = os.path.join(os.getcwd(), "ssl")
        cert_info = get_ssl_cert_info(os.path.join(ssl_dir, "fullchain.pem"))
        if "error" not in cert_info:
            print(f"  SSL: {cert_info['issuerO']} ({cert_info['issuerCN']})")
            print(f"  Valid: {cert_info['notBefore']} - {cert_info['notAfter']}")
        print()

    if run_mode == "DEV":
        app.run(host=host, port=port, debug=True)
    else:
        from hypercorn.config import Config
        from hypercorn.asyncio import serve
        from asgiref.wsgi import WsgiToAsgi

        hc = Config()
        hc.bind = [f"{host}:{port}"]
        hc.loglevel = "WARNING"
        hc.include_server_header = False

        if ssl_active:
            ssl_dir = os.path.join(os.getcwd(), "ssl")
            hc.certfile = os.path.join(ssl_dir, "fullchain.pem")
            hc.keyfile = os.path.join(ssl_dir, "privkey.pem")
            hc.ca_certs = os.path.join(ssl_dir, "chain.pem")

        asgi_app = WsgiToAsgi(app)
        asyncio.run(serve(asgi_app, hc))
