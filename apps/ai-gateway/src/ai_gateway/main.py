import hashlib
from typing import Any

from fastapi import FastAPI, Request

from .contracts import (
    DiaryGenerationResult,
    GatewayGenerateRequest,
    GatewayRegenerateRequest,
    HealthResponse,
)
from .graph import get_diary_graph
from .middleware import internal_secret_middleware, jwt_middleware
from .state import DiaryState

app = FastAPI(title="냥멍일기 AI Gateway")

# FastAPI middleware 등록 순서: 마지막 add가 가장 outer (request를 먼저 받음).
# 의도 흐름: request → internal_secret → jwt → endpoint.
# 따라서 jwt 먼저(inner), internal_secret 나중에(outer) 등록.
app.middleware("http")(jwt_middleware)
app.middleware("http")(internal_secret_middleware)


@app.get("/health")
def health() -> HealthResponse:
    return HealthResponse()


def _hash_user_id(user_id: str) -> str:
    """LangSmith trace 메타데이터용 — PII 회피, sub 노출 X (ADR-0012)."""
    return hashlib.sha256(user_id.encode()).hexdigest()[:16]


def _initial_state(
    req: GatewayGenerateRequest | GatewayRegenerateRequest,
) -> DiaryState:
    is_regen = isinstance(req, GatewayRegenerateRequest)
    return {
        "session_id": req.session_id,
        "seq": req.seq,
        "pet_id": req.pet_id,
        "honorific": req.honorific,
        "species": req.species,
        "gender": req.gender,
        "photo_signed_url": req.photo_signed_url,
        "keywords": req.keywords,
        "recent_diaries": req.recent_diaries,
        "previous_diary_text": req.previous_diary_text if is_regen else None,
        "regen_feedback": req.feedback if is_regen else None,
        "vision_description": None,
        "diary_text": None,
        "short_caption": None,
        "mood_tag": None,
        "safety_retry_count": 0,
        "safety_violation": None,
    }


def _invoke_graph(state: DiaryState, user_id: str) -> DiaryGenerationResult:
    config: dict[str, Any] = {
        "metadata": {
            "session_id": state["session_id"],
            "seq": state["seq"],
            "owner_id_hash": _hash_user_id(user_id),
        },
        "tags": [f"seq:{state['seq']}"],
        "run_name": (
            "diary_generate" if state["seq"] == 1 else "diary_regenerate"
        ),
    }
    final = get_diary_graph().invoke(state, config)
    return DiaryGenerationResult(
        diary_text=final["diary_text"],
        short_caption=final["short_caption"],
        mood_tag=final["mood_tag"],
    )


@app.post("/diary/generate")
def generate(
    req: GatewayGenerateRequest, request: Request
) -> DiaryGenerationResult:
    user_id: str = request.state.user_id
    return _invoke_graph(_initial_state(req), user_id)


@app.post("/diary/regenerate")
def regenerate(
    req: GatewayRegenerateRequest, request: Request
) -> DiaryGenerationResult:
    user_id: str = request.state.user_id
    return _invoke_graph(_initial_state(req), user_id)
