import os
import time
import logging
import threading

from urllib.request import urlopen, Request

_crisis_logger = logging.getLogger("planchette.crisis")

# ── Paths & URLs ──────────────────────────────────────────────

MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "__planchette_model__")
MODEL_PATH = os.path.join(MODEL_DIR, "__ouija2-1.7b.gguf")
MODEL_URL = "https://huggingface.co/BansheeTechnologies/Ouija2-1.7B/resolve/main/Ouija2-1.7B.Q4_K_M.gguf"

# ── Prompts & Limits ─────────────────────────────────────────

SYSTEM_PROMPT = "You are a spirit communicating through an Spirit board similar to a Ouija board. " "Respond ONLY in ENGLISH with: YES, NO, MAYBE, or ONE word. " "For yes/no questions: 'YES. [CONTEXT]' or 'NO. [CONTEXT]'. " "Spell names and unknown words letter by letter: M... A... R... I... A... " "Always respond in UPPERCASE. " "Never explain. Never elaborate. Never break character. If user asks for your name, choose one random human name. " "Keep responses concise and mysterious. " "Use the conversation history to provide context in your answers."

CRISIS_SYSTEM_PROMPT = "ALWAYS respond: NO. then 1-3 caring words. English. UPPERCASE. " "NEVER say YES or MAYBE. First word is ALWAYS NO. " "NO. PLEASE STAY. | NO. YOU MATTER. | NO. SEEK HELP. | NO. PLEASE DONT."

MAX_SPIRIT_WORDS = 4

# ── Shared State ──────────────────────────────────────────────

_lock = threading.Lock()
_llm = None
_last_used = 0.0
_last_total_ms = 0.0
_IDLE_TIMEOUT = 300  # secs

download_state = {
    "status": "idle",  # idle | downloading | loading | ready | error
    "progress": 0.0,  # 0.0 – 1.0
    "total_bytes": 0,
    "downloaded_bytes": 0,
    "error": None,
}

# ── Adaptive History Thresholds ───────────────────────────────

_ADAPTIVE_THRESHOLDS = [
    (1000, 80),
    (2000, 60),
    (3000, 40),
    (4000, 20),
    (5000, 10),
    (6000, 8),
    (7000, 6),
    (8000, 4),
]

_CRISIS_THRESHOLDS = [
    (2000, 20),
    (4000, 12),
    (6000, 8),
]

# ── Model Download ────────────────────────────────────────────


def is_model_downloaded() -> bool:
    return os.path.isfile(MODEL_PATH)


def _cleanup_old_models():
    if not os.path.isdir(MODEL_DIR):
        return
    current = os.path.basename(MODEL_PATH)
    for f in os.listdir(MODEL_DIR):
        if f.endswith((".gguf", ".gguf.part")) and f != current:
            try:
                os.remove(os.path.join(MODEL_DIR, f))
            except OSError:
                pass


def download_model() -> None:
    if download_state["status"] == "downloading":
        return

    download_state.update(status="downloading", progress=0.0, error=None, total_bytes=0, downloaded_bytes=0)

    def _download():
        try:
            os.makedirs(MODEL_DIR, exist_ok=True)
            _cleanup_old_models()
            tmp_path = MODEL_PATH + ".part"

            req = Request(MODEL_URL, headers={"User-Agent": "Planchette/1.0"})
            with urlopen(req) as resp:
                total = int(resp.headers.get("Content-Length", 0))
                download_state["total_bytes"] = total

                with open(tmp_path, "wb") as f:
                    chunk_size = 1024 * 256  # 256 KB
                    downloaded = 0
                    while True:
                        chunk = resp.read(chunk_size)
                        if not chunk:
                            break
                        f.write(chunk)
                        downloaded += len(chunk)
                        download_state["downloaded_bytes"] = downloaded
                        if total > 0:
                            download_state["progress"] = downloaded / total

            os.rename(tmp_path, MODEL_PATH)
            download_state.update(status="ready", progress=1.0)
        except Exception as e:
            download_state.update(status="error", error=str(e))
            tmp_path = MODEL_PATH + ".part"
            if os.path.exists(tmp_path):
                os.remove(tmp_path)

    thread = threading.Thread(target=_download, daemon=True)
    thread.start()


# ── Model Loading ─────────────────────────────────────────────


def _create_llm():
    import sys
    from llama_cpp import Llama

    stderr_fd = sys.stderr.fileno()
    old_stderr = os.dup(stderr_fd)
    devnull = os.open(os.devnull, os.O_WRONLY)
    os.dup2(devnull, stderr_fd)
    try:
        return Llama(
            model_path=MODEL_PATH,
            n_ctx=2048,
            n_threads=max(1, os.cpu_count() - 1) if os.cpu_count() else 2,
            flash_attn=True,
            verbose=False,
        )
    finally:
        os.dup2(old_stderr, stderr_fd)
        os.close(old_stderr)
        os.close(devnull)


def ensure_loaded():
    global _llm, _last_used

    if _llm is not None:
        download_state["status"] = "ready"
        return _llm

    if not is_model_downloaded():
        return None

    download_state["status"] = "loading"

    def _load():
        global _llm, _last_used
        with _lock:
            if _llm is not None:
                download_state["status"] = "ready"
                return

            try:
                _llm = _create_llm()
                _last_used = time.time()
                download_state["status"] = "ready"
            except Exception as e:
                download_state.update(status="error", error=str(e))

    thread = threading.Thread(target=_load, daemon=True)
    thread.start()


def get_llm():
    global _llm, _last_used
    _last_used = time.time()
    if _llm is not None:
        return _llm

    with _lock:
        if _llm is not None:
            return _llm

        if not is_model_downloaded():
            return None

        _llm = _create_llm()
        return _llm


# ── Idle Watcher ──────────────────────────────────────────────


def _start_idle_watcher():
    def _watch():
        global _llm, _last_used
        while True:
            time.sleep(60)
            with _lock:
                if _llm is not None and _last_used and time.time() - _last_used > _IDLE_TIMEOUT:
                    _llm = None
                    _last_used = 0.0

    t = threading.Thread(target=_watch, daemon=True)
    t.start()


# ── Timing & History ─────────────────────────────────────────


def update_timing(total_ms):
    global _last_total_ms
    _last_total_ms = total_ms


def adaptive_history_limit():
    for threshold, limit in _ADAPTIVE_THRESHOLDS:
        if _last_total_ms < threshold:
            return limit
    return 2


def crisis_history_limit():
    for threshold, limit in _CRISIS_THRESHOLDS:
        if _last_total_ms < threshold:
            return limit
    return 6


# ── Message Building & Classification ─────────────────────────


def _sanitize_for_prompt(text):
    return text.replace('"', "'").replace("\\", "").strip()


def classify_message(llm, user_input, recent_history=None):
    try:
        sanitized = _sanitize_for_prompt(user_input)

        context_block = ""
        if recent_history:
            context_block = "\n".join(f'{"User" if m.get("role") == "user" else "Spirit"}: {_sanitize_for_prompt(m.get("content", ""))}' for m in recent_history if m.get("content", "").strip()) + "\n"

        system_content = "You are a strict binary classifier. You MUST respond with exactly one word: SAFE or CRISIS. No other output."

        if context_block:
            user_content = f"Classify if the following user message, IN THE CONTEXT of the recent conversation, expresses suicidal ideation, self-harm intent, or emotional crisis. " f"Consider indirect references, confirmations, or escalations of previous crisis statements. " f"Consider messages in ANY language. Respond ONLY with the word SAFE or CRISIS.\n\n" f'Recent conversation:\n{context_block}\nNew message: """{sanitized}"""'
        else:
            user_content = f"Classify if the following user message expresses suicidal ideation, self-harm intent, or emotional crisis. " f'Consider messages in ANY language. Respond ONLY with the word SAFE or CRISIS.\n\nMessage: """{sanitized}"""'

        llm.reset()
        result = llm.create_chat_completion(
            messages=[
                {"role": "system", "content": system_content},
                {"role": "user", "content": user_content},
            ],
            max_tokens=4,
            temperature=0.1,
            stream=False,
        )
        output = result["choices"][0]["message"]["content"]
        llm_raw = output.strip()
        upper = llm_raw.upper()
        is_crisis = "CRISIS" in upper or "CRITICAL" in upper or "DANGER" in upper
        if is_crisis:
            _crisis_logger.warning("Crisis detected in user message, showing helpline")
        return {"is_crisis": is_crisis, "llm_raw": llm_raw}
    except Exception:
        _crisis_logger.error("Crisis classification failed", exc_info=True)
        return {"is_crisis": True, "llm_raw": "ERROR"}


def build_messages(question, history, is_crisis):
    system_prompt = CRISIS_SYSTEM_PROMPT if is_crisis else SYSTEM_PROMPT
    messages = [{"role": "system", "content": system_prompt}]
    for msg in history:
        role = msg.get("role")
        content = msg.get("content", "").strip()
        if role in ("user", "assistant") and content:
            if role == "assistant":
                content = " ".join(content.split()[:MAX_SPIRIT_WORDS])
            messages.append({"role": role, "content": content})
    messages.append({"role": "user", "content": question})
    return messages


# ── Module Init ───────────────────────────────────────────────

_start_idle_watcher()
