import os
import re
import json
import time
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
    ensure_loaded,
    classify_message,
    build_messages,
    adaptive_history_limit,
    crisis_history_limit,
    update_timing,
)


auth_bp = Blueprint("auth_bp", __name__)

_recent_responses = {}  # Normalized + 120s timestampt
_response_seen = {}  # Normalized + First Seen


def _normalize_response(text):
    return re.sub(r"[^A-Z]", "", text.upper())


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
    if download_state["status"] == "loading":
        return jsonify({"status": "loading", "progress": 1.0})
    if is_model_downloaded() and download_state["status"] != "error":
        return jsonify({"status": "ready", "progress": 1.0})
    return jsonify(download_state)


@api_bp.route("/model/download", methods=["POST"])
@login_required
def model_download():
    if is_model_downloaded():
        return jsonify({"status": "ready"})
    download_model()
    return jsonify({"status": "downloading"})


@api_bp.route("/model/load", methods=["POST"])
@login_required
def model_load():
    if not is_model_downloaded():
        return jsonify({"error": "Model not downloaded"}), 400
    ensure_loaded()
    return jsonify({"status": "loading"})


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

    history = (data or {}).get("history", [])

    check_crisis = (data or {}).get("checkCrisis", False)
    t_crisis = time.perf_counter()
    crisis_hist = history[-crisis_history_limit() :] if check_crisis else None
    crisis_result = classify_message(llm, question, crisis_hist) if check_crisis else None
    crisis = crisis_result["is_crisis"] if crisis_result else False
    crisis_ms = (time.perf_counter() - t_crisis) * 1000

    hist_limit = adaptive_history_limit()
    history = history[-hist_limit:]

    # Anti-repeat Cleanup Logic
    now = time.time()
    for cache in (_recent_responses, _response_seen):
        expired = [k for k, t in cache.items() if now - t > 120]
        for k in expired:
            del cache[k]

    if not crisis:
        filtered = []
        for msg in history:
            if msg.get("role") == "assistant":
                key = _normalize_response(msg.get("content", ""))
                if key in _recent_responses:
                    if filtered and filtered[-1].get("role") == "user":
                        filtered.pop()
                    continue
            filtered.append(msg)
        history = filtered
    messages = build_messages(question, history, crisis)

    max_tokens = 10 if crisis else 33
    temperature = 0.3 if crisis else 0.8

    def generate():
        t_resp = time.perf_counter()
        token_count = 0
        full_response = []
        llm.reset()
        stream = llm.create_chat_completion(
            messages=messages,
            max_tokens=max_tokens,
            temperature=temperature,
            top_p=0.9,
            repeat_penalty=1.3,
            frequency_penalty=0.0,
            stream=True,
        )
        try:
            for chunk in stream:
                delta = chunk["choices"][0]["delta"]
                token = delta.get("content", "")
                if token:
                    token_count += 1
                    full_response.append(token)
                    yield f"data: {json.dumps({'token': token})}\n\n"

            # Anti-repeat Ban Logic
            if not crisis:
                full_text = "".join(full_response)
                resp_key = _normalize_response(full_text)
                if resp_key:
                    if resp_key in _response_seen:
                        _recent_responses[resp_key] = time.time()
                    else:
                        _response_seen[resp_key] = time.time()

            resp_ms = (time.perf_counter() - t_resp) * 1000
            total_ms = crisis_ms + resp_ms
            update_timing(total_ms)
            perf = {"crisis_ms": round(crisis_ms), "response_ms": round(resp_ms), "total_ms": round(total_ms), "tokens": token_count, "history_len": len(history), "history_limit": hist_limit}
            if crisis_result:
                perf["crisis_input"] = question
                perf["crisis_llm_raw"] = crisis_result["llm_raw"]
                perf["crisis_result"] = "CRISIS" if crisis_result["is_crisis"] else "SAFE"
            yield f"data: {json.dumps({'done': True, 'perf': perf})}\n\n"
        except GeneratorExit:
            return

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

    if wants_password:
        if not verify_password(current_user, current_pw):
            return jsonify({"error": "Current password is incorrect."}), 400
        if not new_pw:
            return jsonify({"error": "New password cannot be empty."}), 400
        if new_pw != confirm_pw:
            return jsonify({"error": "New passwords do not match."}), 400

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
