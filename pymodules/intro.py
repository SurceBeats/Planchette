import re
import sys

# ANSI
DIM = "\033[2m"
AMBER = "\033[38;5;178m"
DARK = "\033[38;5;94m"
RESET = "\033[0m"
BOLD = "\033[1m"

_ANSI_RE = re.compile(r"\033\[[0-9;]*m")
W = 58  # inner width between the two ║ chars


def _vis_len(s: str) -> int:
    return len(_ANSI_RE.sub("", s))


def _pad(s: str) -> str:
    return s + " " * (W - _vis_len(s))


def _line(content: str = "") -> str:
    return f"    {DARK}║{RESET}{_pad(content)}{DARK}║{RESET}"


def _sep() -> str:
    return f"    {DARK}╠{'═' * W}╣{RESET}"


def _row(label: str, value: str, col: int = 10) -> str:
    vis_label = _ANSI_RE.sub("", label)
    gap = " " * (col - len(vis_label))
    return _line(f"  {label}{gap}{value}")


def show_banner(host: str, port: int, mode: str, ssl: bool = False):
    protocol = "https" if ssl else "http"
    url = f"{protocol}://{host}:{port}"

    art = [
        f"  {AMBER}{BOLD}  ____  _                  _          _   _       {RESET}",
        f"  {AMBER}{BOLD} |  _ \\| | __ _ _ __   ___| |__   ___| |_| |_ ___{RESET}",
        f"  {AMBER}{BOLD} | |_) | |/ _` | '_ \\ / __| '_ \\ / _ \\ __| __/ _ \\{RESET}",
        f"  {AMBER}{BOLD} |  __/| | (_| | | | | (__| | | |  __/ |_| ||  __/{RESET}",
        f"  {AMBER}{BOLD} |_|   |_|\\__,_|_| |_|\\___|_| |_|\\___|\\__|\\__\\___|{RESET}",
    ]

    lines = [
        "",
        f"    {DARK}╔{'═' * W}╗{RESET}",
        _line(),
    ]

    for a in art:
        lines.append(_line(a))

    lines.append(_line())
    lines.append(_line(f"  {DIM} T A L K I N G   B O A R D{RESET}"))
    lines.append(_line())
    lines.append(_sep())
    lines.append(_line())
    lines.append(_row(f"{DIM}Server{RESET}", url))
    lines.append(_row(f"{DIM}Mode{RESET}", mode))
    lines.append(_row(f"{DIM}SSL{RESET}", f"\033[92mEnabled\033[0m" if ssl else f"\033[91mDisabled\033[0m"))
    lines.append(_row(f"{DIM}Model{RESET}", "Ouija-3B (Q4_K_M)"))
    gpu = False
    try:
        from llama_cpp import llama_supports_gpu_offload

        gpu = llama_supports_gpu_offload()
    except Exception:
        pass
    lines.append(_row(f"{DIM}Engine{RESET}", f"llama.cpp ({'GPU' if gpu else 'CPU'})"))
    lines.append(_line())
    lines.append(_row(f"{DIM}License{RESET}", "AGPL-3.0"))
    lines.append(_line())
    lines.append(_row(f"{DIM}By{RESET}", "@SurceBeats"))
    lines.append(_row(f"{DIM}GitHub{RESET}", "https://github.com/SurceBeats"))
    lines.append(_line())
    lines.append(f"    {DARK}╚{'═' * W}╝{RESET}")
    lines.append("")

    sys.stdout.write("\n".join(lines) + "\n")
    sys.stdout.flush()
