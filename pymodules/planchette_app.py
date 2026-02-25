import os
import mimetypes
import configparser

from flask import Flask

mimetypes.add_type("application/javascript", ".js")
mimetypes.add_type("text/css", ".css")

from vite_fusion import register_vite_assets

from pymodules.auth import login_manager, load_user_from_hash
from pymodules.config import has_credentials
from pymodules.routes import auth_bp, main_bp, api_bp, static_bp


def create_app(cfg: configparser.ConfigParser, config_path: str) -> Flask:
    run_mode = cfg.get("server", "run_mode", fallback="PROD")

    app = Flask(
        __name__,
        static_folder=None,
        template_folder=os.path.join(os.path.dirname(os.path.dirname(__file__)), "templates"),
    )

    app.secret_key = cfg.get("security", "secret_key")
    app.config["RUN_MODE"] = run_mode
    app.config["CONFIG_PATH"] = config_path
    app.config["CFG"] = cfg

    login_manager.init_app(app)

    register_vite_assets(
        app,
        dev_mode=(run_mode == "DEV"),
        dev_server_url="http://localhost:5173",
        dist_path="/src/dist",
        manifest_path="src/dist/.vite/manifest.json",
    )

    @app.context_processor
    def inject_globals():
        return {"dev_mode": run_mode == "DEV"}

    app.register_blueprint(auth_bp)
    app.register_blueprint(main_bp)
    app.register_blueprint(api_bp)
    app.register_blueprint(static_bp)

    if has_credentials(cfg):
        with app.app_context():
            load_user_from_hash(cfg.get("auth", "user"), cfg.get("auth", "pw_hash"))

    return app
