"""
Audio transcription router — FloraNet.

Fully open-source speech-to-text via faster-whisper (CTranslate2 re-implementation
of OpenAI Whisper, MIT-licensed). Models are downloaded once into
WHISPER_MODEL_DIR and then run 100% locally — no API keys, no cloud calls.

If the model cannot be loaded (e.g. first boot with no internet), the endpoint
returns an explicit 503 — never a fabricated transcript.
"""

import os
import threading

from fastapi import APIRouter, File, HTTPException, UploadFile

router = APIRouter()

# ──────────────────────────────────────────────────────────────────────────────
# Language capability resolution
#
# Whisper implements a fixed set of 100 language codes. Several BRICS languages
# are NOT in it — notably isiZulu (`zu`) and isiXhosa (`xh`), the two most-spoken
# South African languages, and Odia (`or`). Passing an unimplemented code to
# faster-whisper raises ValueError, so unsupported languages are resolved to
# automatic detection and reported back as `language_supported: false` rather
# than failing the request or silently pretending the language was honoured.
# ──────────────────────────────────────────────────────────────────────────────

# UI locale primary subtag -> Whisper code, listed only for languages this
# deployment's users speak. Anything else Whisper implements still passes
# straight through (see _resolve_whisper_language).
_LOCALE_TO_WHISPER = {
    # India — the Eighth Schedule languages Whisper implements.
    "hi": "hi", "bn": "bn", "te": "te", "mr": "mr", "ta": "ta",
    "gu": "gu", "ur": "ur", "kn": "kn", "ml": "ml", "pa": "pa",
    "as": "as", "ne": "ne", "sd": "sd", "sa": "sa",
    # Brazil / Russia / China.
    "pt": "pt", "ru": "ru", "zh": "zh", "yue": "yue",
    # South Africa — Whisper implements Afrikaans and English only.
    "af": "af", "en": "en",
    # 2024+ members — Egypt & UAE (Arabic), Iran (Persian), Ethiopia (Amharic).
    "ar": "ar", "fa": "fa", "am": "am",
}

# Spoken in the BRICS locale set but absent from Whisper's language set. Kept as
# an explicit list so the API can name them in its diagnostics instead of
# leaving the frontend to guess why detection looks wrong.
_KNOWN_UNSUPPORTED = {
    "zu": "isiZulu", "xh": "isiXhosa", "or": "Odia",
    "mai": "Maithili", "sat": "Santali", "ks": "Kashmiri",
    "kok": "Konkani", "doi": "Dogri", "mni": "Manipuri",
    "brx": "Bodo", "nso": "Sepedi", "tn": "Setswana",
    "st": "Sesotho", "ts": "Xitsonga", "ss": "siSwati",
    "ve": "Tshivenda", "nr": "isiNdebele", "sasl": "South African Sign Language",
}

_whisper_codes_cache = None


def _whisper_language_codes() -> frozenset:
    """
    The language codes the installed faster-whisper actually accepts.

    Read from the library rather than hardcoded so this can never drift from
    the model that will do the work. Empty set means "unknown" — callers then
    fall back to resolving purely through `_LOCALE_TO_WHISPER`.
    """
    global _whisper_codes_cache
    if _whisper_codes_cache is None:
        try:
            from faster_whisper.tokenizer import _LANGUAGE_CODES

            _whisper_codes_cache = frozenset(_LANGUAGE_CODES)
        except Exception:
            _whisper_codes_cache = frozenset()
    return _whisper_codes_cache


def _resolve_whisper_language(locale: str):
    """
    Resolve a UI locale to a Whisper language code.

    Accepts BCP-47 (`ta-IN`, `pt-BR`, `zu-ZA`) or a bare ISO 639 code (`ta`).
    Returns `(whisper_code, supported, reason)` where `whisper_code` is None when
    the requested language is not implemented — the caller then transcribes with
    auto-detection and says so, instead of raising.
    """
    raw = (locale or "").strip().replace("_", "-")
    primary = raw.split("-")[0].lower()
    if not primary:
        return None, True, "no language requested — auto-detecting"

    code = _LOCALE_TO_WHISPER.get(primary, primary)
    implemented = _whisper_language_codes()

    # No library info available: trust the curated map and let Whisper's own
    # auto-detection cover anything unknown, rather than guessing here.
    if not implemented:
        return (code, True, "") if primary in _LOCALE_TO_WHISPER else (None, True, "")

    if code in implemented:
        return code, True, ""

    label = _KNOWN_UNSUPPORTED.get(primary, primary)
    return None, False, (
        f"'{label}' is not implemented by the local Whisper model, so this "
        "transcript used automatic language detection and may be inaccurate."
    )

_model = None
_model_lock = threading.Lock()
_model_error = None


def _get_model():
    """Load the local Whisper model once (thread-safe). Returns None on failure."""
    global _model, _model_error
    if _model is not None:
        return _model
    with _model_lock:
        if _model is not None:
            return _model
        try:
            from faster_whisper import WhisperModel

            size = os.environ.get("WHISPER_MODEL_SIZE", "base")
            _model = WhisperModel(
                size,
                device=os.environ.get("WHISPER_DEVICE", "cpu"),
                compute_type=os.environ.get("WHISPER_COMPUTE_TYPE", "int8"),
                download_root=os.environ.get("WHISPER_MODEL_DIR") or None,
                cpu_threads=int(os.environ.get("WHISPER_CPU_THREADS", "4")),
            )
            _model_error = None
            return _model
        except Exception as exc:
            _model_error = f"{type(exc).__name__}: {exc}"
            return None


@router.post("/audio/transcribe")
async def transcribe_audio(file: UploadFile = File(...), language: str = "en-US"):
    """
    Transcribe a farmer's voice note locally with faster-whisper.

    Supported containers: wav / mp3 / ogg / webm / m4a (decoded by PyAV
    internally). `language` accepts a BCP-47 locale (`ta-IN`, `pt-BR`, `zu-ZA`)
    or a bare ISO 639 code (`ta`).

    When the requested language is not implemented by the local model the
    request still succeeds using automatic detection, and `language_supported`
    plus `notice` say so explicitly — the transcript is never presented as
    something it is not.
    """
    if not file.filename or not file.filename.endswith((".wav", ".mp3", ".ogg", ".webm", ".m4a")):
        raise HTTPException(status_code=400, detail="Unsupported file format")

    model = _get_model()
    if model is None:
        raise HTTPException(
            status_code=503,
            detail=(
                "Speech-to-text unavailable: the local Whisper model could not be "
                f"loaded ({_model_error}). On first boot it must be downloaded once; "
                "no transcript is fabricated in its absence."
            ),
        )

    audio_bytes = await file.read()
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="Empty audio upload")

    import tempfile

    whisper_lang, language_supported, notice = _resolve_whisper_language(language)

    tmp_path = None
    suffix = os.path.splitext(file.filename or "audio.wav")[1] or ".wav"
    try:
        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
            tmp.write(audio_bytes)
            tmp_path = tmp.name

        segments, info = model.transcribe(
            tmp_path,
            language=whisper_lang,  # None → auto-detect
            beam_size=1,  # greedy: fast on CPU, deterministic
            vad_filter=True,
        )
        transcript = "".join(seg.text for seg in segments).strip()

        return {
            "transcript": transcript,
            "engine": "faster-whisper",
            "model_size": os.environ.get("WHISPER_MODEL_SIZE", "base"),
            "language_requested": language,
            "language_supported": language_supported,
            "whisper_language": whisper_lang,
            "notice": notice or None,
            "detected_language": getattr(info, "language", None),
            "language_probability": (
                round(float(getattr(info, "language_probability", 0.0)), 3)
                if getattr(info, "language_probability", None) is not None
                else None
            ),
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {exc}")
    finally:
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except OSError:
                pass


@router.get("/audio/languages")
def audio_languages() -> dict:
    """
    Which languages the local speech model can actually transcribe.

    The frontend reads this instead of hardcoding a list, so a farmer is told
    honestly when their language is not yet supported. isiZulu, isiXhosa and
    Odia — among others — are absent from Whisper's 100-language set; those are
    named in `unsupported_in_whisper` rather than left for the UI to infer.
    """
    implemented = _whisper_language_codes()
    return {
        "engine": "faster-whisper",
        "model_size": os.environ.get("WHISPER_MODEL_SIZE", "base"),
        "model_loaded": _model is not None,
        "supported_count": len(implemented),
        "supported": sorted(implemented),
        "locales": {
            primary: {
                "whisper_language": code,
                "supported": (code in implemented) if implemented else None,
            }
            for primary, code in sorted(_LOCALE_TO_WHISPER.items())
        },
        "unsupported_in_whisper": {
            code: label for code, label in sorted(_KNOWN_UNSUPPORTED.items())
        },
        "autodetect_supported": True,
    }
