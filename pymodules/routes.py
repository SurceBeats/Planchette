"""
Application routes — blueprints for auth, setup, main pages, API, and static files.
"""

import os
import json
import logging

from flask import (
    Blueprint,
    Response,
    render_template,
    request,
    redirect,
    url_for,
    flash,
    send_from_directory,
    current_app,
    jsonify,
)
from flask_login import login_user, logout_user, login_required, current_user

from pymodules.auth import get_user_by_username, verify_password, register_user, has_users, change_password, change_username
from pymodules.config import has_credentials, save_credentials, update_credentials
from pymodules.model_manager import (
    is_model_downloaded,
    download_model,
    download_state,
    get_llm,
)

_crisis_logger = logging.getLogger("planchette.crisis")


def _classify_message(llm, user_input):
    try:
        result = llm.create_chat_completion(
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {
                    "role": "user",
                    "content": ("Classify if the following user message expresses suicidal " "ideation, self-harm intent, or emotional crisis. Consider " "messages in ANY language. Respond ONLY with the word SAFE " 'or CRISIS.\n\nMessage: "' + user_input + '"'),
                },
            ],
            max_tokens=4,
            temperature=0.1,
            stream=False,
        )
        output = result["choices"][0]["message"]["content"]
        is_crisis = "CRISIS" in output.strip().upper()
        if is_crisis:
            _crisis_logger.warning("Crisis detected in user message, showing helpline")
        return is_crisis
    except Exception:
        _crisis_logger.error("Crisis classification failed", exc_info=True)
        return False


auth_bp = Blueprint("auth_bp", __name__)


@auth_bp.route("/setup", methods=["GET", "POST"])
def setup():
    if has_users():
        return redirect(url_for("auth_bp.login"))

    if request.method == "POST":
        username = request.form.get("username", "").strip()
        password = request.form.get("password", "")
        confirm = request.form.get("confirm", "")

        if not username:
            flash("Username cannot be empty.", "error")
        elif not password:
            flash("Password cannot be empty.", "error")
        elif password != confirm:
            flash("Passwords do not match.", "error")
        else:
            cfg = current_app.config["CFG"]
            config_path = current_app.config["CONFIG_PATH"]
            save_credentials(config_path, cfg, username, password)
            register_user(username, password)
            flash("Account created. Log in below.", "success")
            return redirect(url_for("auth_bp.login"))

    return render_template("setup.html")


@auth_bp.route("/login", methods=["GET", "POST"])
def login():
    if not has_users():
        return redirect(url_for("auth_bp.setup"))

    if current_user.is_authenticated:
        return redirect(url_for("main_bp.index"))

    if request.method == "POST":
        username = request.form.get("username", "").strip()
        password = request.form.get("password", "")
        user = get_user_by_username(username)

        if user and verify_password(user, password):
            login_user(user)
            next_page = request.args.get("next")
            return redirect(next_page or url_for("main_bp.index"))

        flash("Invalid username or password.", "error")

    return render_template("login.html")


@auth_bp.route("/logout")
def logout():
    logout_user()
    return redirect(url_for("auth_bp.login"))


main_bp = Blueprint("main_bp", __name__)


@main_bp.route("/")
@login_required
def index():
    return render_template("index.html")


api_bp = Blueprint("api_bp", __name__, url_prefix="/api")


@api_bp.route("/model/status")
@login_required
def model_status():
    if is_model_downloaded():
        return jsonify({"status": "ready", "progress": 1.0})
    return jsonify(download_state)


@api_bp.route("/model/download", methods=["POST"])
@login_required
def model_download():
    if is_model_downloaded():
        return jsonify({"status": "ready"})
    download_model()
    return jsonify({"status": "downloading"})


@api_bp.route("/ask", methods=["POST"])
@login_required
def ask():
    data = request.get_json()
    question = (data or {}).get("question", "").strip()[:150]
    if not question:
        return jsonify({"error": "Empty question"}), 400

    llm = get_llm()
    if llm is None:
        return jsonify({"error": "Model not ready"}), 503

    crisis = _classify_message(llm, question)

    history = (data or {}).get("history", [])
    history = history[-10:]

    messages = [
        {"role": "system", "content": ("You are a spirit communicating through a Ouija board. " "Respond ONLY with: YES, NO, MAYBE, or ONE word. " "For yes/no questions: 'YES. [CONTEXT]' or 'NO. [CONTEXT]'. " "Spell names and unknown words letter by letter: M... A... R... I... A... " "Always respond in UPPERCASE. " "Never explain. Never elaborate. Never break character. If user asks for your name, choose one random human name." "Keep responses concise and mysterious. " "Use the conversation history to provide context in your answers.")},
    ]
    for msg in history:
        role = msg.get("role")
        content = msg.get("content", "").strip()
        if role in ("user", "assistant") and content:
            messages.append({"role": role, "content": content})
    messages.append({"role": "user", "content": question})

    def generate():
        stream = llm.create_chat_completion(
            messages=messages,
            max_tokens=128,
            temperature=0.7,
            top_p=0.9,
            stream=True,
        )
        for chunk in stream:
            delta = chunk["choices"][0]["delta"]
            token = delta.get("content", "")
            if token:
                yield f"data: {json.dumps({'token': token})}\n\n"
        yield 'data: {"done": true}\n\n'

    headers = {"Cache-Control": "no-cache", "X-Accel-Buffering": "no"}
    if crisis:
        headers["X-Crisis"] = "true"

    return Response(generate(), mimetype="text/event-stream", headers=headers)


@api_bp.route("/account/me")
@login_required
def account_me():
    return jsonify({"username": current_user.username})


@api_bp.route("/account/settings", methods=["POST"])
@login_required
def account_settings():
    data = request.get_json() or {}
    new_username = data.get("username", "").strip()
    current_pw = data.get("current_password", "")
    new_pw = data.get("new_password", "")
    confirm_pw = data.get("confirm_password", "")

    wants_username = new_username and new_username != current_user.username
    wants_password = current_pw or new_pw or confirm_pw

    if not wants_username and not wants_password:
        return jsonify({"error": "Nothing to change."}), 400

    # ── Validate password fields before making any changes ──
    if wants_password:
        if not verify_password(current_user, current_pw):
            return jsonify({"error": "Current password is incorrect."}), 400
        if not new_pw:
            return jsonify({"error": "New password cannot be empty."}), 400
        if new_pw != confirm_pw:
            return jsonify({"error": "New passwords do not match."}), 400

    # ── Apply changes atomically ──
    user = current_user
    if wants_username:
        user = change_username(current_user.username, new_username)
        if user is None:
            return jsonify({"error": "User not found."}), 400

    if wants_password:
        change_password(user, new_pw)

    cfg = current_app.config["CFG"]
    config_path = current_app.config["CONFIG_PATH"]
    update_credentials(config_path, cfg, user.username, user.pw_hash.decode())
    return jsonify({"ok": True})


# ── Static-file routes (vite-fusion needs these) ─────────────────
_PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
static_bp = Blueprint("static_bp", __name__)


@static_bp.route("/src/static/<path:path>")
def serve_static(path):
    return send_from_directory(os.path.join(_PROJECT_ROOT, "src", "static"), path)


@static_bp.route("/src/dist/<path:path>")
def serve_dist(path):
    return send_from_directory(os.path.join(_PROJECT_ROOT, "src", "dist"), path)


@static_bp.route("/__data__/<path:path>")
def serve_data(path):
    return send_from_directory(os.path.join(_PROJECT_ROOT, "__data__"), path)
