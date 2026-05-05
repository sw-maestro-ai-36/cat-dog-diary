"""LangGraph 조립.

토폴로지:
START → prepare_context → analyze_image → write_diary → safety_check → (cond)
                                                ↑                              │
                                                └─── violation && retry < max ──┘

vision/diary 책임 분리: analyze_image(agents/vision.py)가 사진 묘사 1단락을
state["vision_description"]에 채우면 write_diary(agents/diary.py)가 그 텍스트만
보고 작문. retry edge는 write_diary로만 돌아가 vision 재호출 없음.
"""
from functools import lru_cache
from typing import Any

from langgraph.graph import END, START, StateGraph

from .agents.diary import safety_check, should_retry, write_diary
from .agents.vision import analyze_image
from .state import DiaryState


def prepare_context(state: DiaryState) -> dict:
    """Entry node. 입력 sanity 훅 — 현재 noop (Pydantic 검증으로 충분)."""
    return {}


@lru_cache(maxsize=1)
def get_diary_graph() -> Any:
    builder: StateGraph = StateGraph(DiaryState)
    builder.add_node("prepare_context", prepare_context)
    builder.add_node("analyze_image", analyze_image)
    builder.add_node("write_diary", write_diary)
    builder.add_node("safety_check", safety_check)

    builder.add_edge(START, "prepare_context")
    builder.add_edge("prepare_context", "analyze_image")
    builder.add_edge("analyze_image", "write_diary")
    builder.add_edge("write_diary", "safety_check")
    builder.add_conditional_edges(
        "safety_check",
        should_retry,
        {"write_diary": "write_diary", END: END},
    )

    return builder.compile()
