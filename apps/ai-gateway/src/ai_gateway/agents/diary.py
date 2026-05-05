"""Diary agent — 일기 작성 + safety_check.

기존 nodes.py를 모듈로 이동. 동작 변경 없음 (이미지 입력 + structured output
+ safety retry 모두 그대로). vision agent 분리는 후속 step에서.
"""
from functools import lru_cache
from typing import Any

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from langgraph.graph import END

from ..config import get_settings
from ..contracts import DiaryGenerationResult
from ..prompts_loader import build_system_message, build_user_message
from ..state import DiaryState

# 안전 호출 max: 첫 호출 + retry 1회 = 2회 (ADR-0005 본문).
SAFETY_MAX_CALLS = 2


@lru_cache(maxsize=1)
def _diary_llm() -> Any:
    """structured outputs로 DiaryGenerationResult 강제하는 ChatOpenAI singleton."""
    get_settings()  # OPENAI_API_KEY를 os.environ에 export 보장.
    return ChatOpenAI(
        model="gpt-4o-mini",
        temperature=0.7,
    ).with_structured_output(DiaryGenerationResult)


def call_llm(state: DiaryState) -> dict:
    system_text = build_system_message(state)
    user_text = build_user_message(state)

    messages = [
        SystemMessage(content=system_text),
        HumanMessage(
            content=[
                {"type": "text", "text": user_text},
                {
                    "type": "image_url",
                    "image_url": {
                        "url": state["photo_signed_url"],
                        "detail": "low",
                    },
                },
            ]
        ),
    ]

    result = _diary_llm().invoke(messages)
    assert isinstance(result, DiaryGenerationResult)

    return {
        "diary_text": result.diary_text,
        "short_caption": result.short_caption,
        "mood_tag": result.mood_tag,
        "safety_retry_count": state["safety_retry_count"] + 1,
    }


def safety_check(state: DiaryState) -> dict:
    """ADR-0005 부록 의사코드: honorific substring + 길이 sanity."""
    diary = state.get("diary_text") or ""
    caption = state.get("short_caption") or ""
    honorific = state["honorific"]

    if honorific not in diary:
        return {"safety_violation": "honorific_missing"}
    if not 50 <= len(diary) <= 1000:
        return {"safety_violation": "diary_length"}
    if not 1 <= len(caption) <= 100:
        return {"safety_violation": "caption_length"}
    return {"safety_violation": None}


def should_retry(state: DiaryState) -> str:
    """conditional edge — violation && safety_retry_count < SAFETY_MAX_CALLS → retry."""
    if state["safety_violation"] and state["safety_retry_count"] < SAFETY_MAX_CALLS:
        return "call_llm"
    return END
