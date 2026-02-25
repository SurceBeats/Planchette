import os
import bcrypt
import secrets
import configparser


def _generate_secret_key() -> str:
    return secrets.token_hex(32)


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def ensure_config(config_path: str) -> configparser.ConfigParser:
    cfg = configparser.ConfigParser()
    needs_write = False

    if os.path.exists(config_path):
        cfg.read(config_path)
    else:
        print(f"[Planchette] {config_path} not found — generating…")
        needs_write = True

    if not cfg.has_section("server"):
        cfg.add_section("server")
        needs_write = True
    for key, default in [("host", "0.0.0.0"), ("port", "7777"), ("run_mode", "PROD")]:
        if not cfg.has_option("server", key):
            cfg.set("server", key, default)
            needs_write = True

    if not cfg.has_section("security"):
        cfg.add_section("security")
        needs_write = True
    if not cfg.has_option("security", "secret_key"):
        key = _generate_secret_key()
        cfg.set("security", "secret_key", key)
        print("[Planchette] Generated random secret_key.")
        needs_write = True

    if needs_write:
        with open(config_path, "w") as f:
            cfg.write(f)
        print(f"[Planchette] Saved {config_path}")

    return cfg


def has_credentials(cfg: configparser.ConfigParser) -> bool:
    return cfg.has_option("auth", "user") and cfg.has_option("auth", "pw_hash")


def save_credentials(config_path: str, cfg: configparser.ConfigParser, user: str, password: str):
    if not cfg.has_section("auth"):
        cfg.add_section("auth")
    cfg.set("auth", "user", user)
    cfg.set("auth", "pw_hash", hash_password(password))
    with open(config_path, "w") as f:
        cfg.write(f)


def update_credentials(config_path: str, cfg: configparser.ConfigParser, username: str, pw_hash_str: str):
    if not cfg.has_section("auth"):
        cfg.add_section("auth")
    cfg.set("auth", "user", username)
    cfg.set("auth", "pw_hash", pw_hash_str)
    with open(config_path, "w") as f:
        cfg.write(f)
