import os
import time
import threading

from urllib.request import urlopen, Request

MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "__planchette_model__")
MODEL_PATH = os.path.join(MODEL_DIR, "__ouija-3b.gguf")
MODEL_URL = "https://huggingface.co/BansheeTechnologies/Ouija-3B/resolve/main/Ouija-3B-Q4_K_M.gguf"

# Shared State
_lock = threading.Lock()
_llm = None
_last_used = 0.0
_IDLE_TIMEOUT = 300  # secs

download_state = {
    "status": "idle",  # idle | downloading | ready | error
    "progress": 0.0,  # 0.0 – 1.0
    "total_bytes": 0,
    "downloaded_bytes": 0,
    "error": None,
}


def is_model_downloaded() -> bool:
    return os.path.isfile(MODEL_PATH)


def download_model() -> None:
    if download_state["status"] == "downloading":
        return

    download_state.update(status="downloading", progress=0.0, error=None, total_bytes=0, downloaded_bytes=0)

    def _download():
        try:
            os.makedirs(MODEL_DIR, exist_ok=True)
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


_start_idle_watcher()


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

        import ctypes
        import sys
        from llama_cpp import Llama

        stderr_fd = sys.stderr.fileno()
        old_stderr = os.dup(stderr_fd)
        devnull = os.open(os.devnull, os.O_WRONLY)
        os.dup2(devnull, stderr_fd)

        try:
            _llm = Llama(
                model_path=MODEL_PATH,
                n_ctx=4096,
                n_threads=max(1, os.cpu_count() - 1) if os.cpu_count() else 2,
                verbose=False,
            )
        finally:
            os.dup2(old_stderr, stderr_fd)
            os.close(old_stderr)
            os.close(devnull)

        return _llm
