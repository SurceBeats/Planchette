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

CONFIG_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "planchette.ini")

cfg = ensure_config(CONFIG_PATH)

app = create_app(cfg, CONFIG_PATH)

if __name__ == "__main__":
    host = cfg.get("server", "host", fallback="0.0.0.0")
    port = cfg.getint("server", "port", fallback=5000)
    run_mode = cfg.get("server", "run_mode", fallback="PROD")

    show_banner(host, port, run_mode)

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

        asgi_app = WsgiToAsgi(app)
        asyncio.run(serve(asgi_app, hc))
