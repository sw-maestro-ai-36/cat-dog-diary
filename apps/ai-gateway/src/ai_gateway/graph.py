"""LangGraph 조립. ADR-0005 부록 토폴로지 정합.

START → prepare_context → call_llm → safety_check → (conditional)
                                                     ├─ violation && retry < max → call_llm
                                                     └─ else → END
"""
from functools import lru_cache
from typing import Any

from langgraph.graph import END, START, StateGraph

from .agents.diary import call_llm, safety_check, should_retry
from .state import DiaryState


def prepare_context(state: DiaryState) -> dict:
    """Entry node. 입력 sanity 훅 — 현재 noop (Pydantic 검증으로 충분)."""
    return {}


@lru_cache(maxsize=1)
def get_diary_graph() -> Any:
    builder: StateGraph = StateGraph(DiaryState)
    builder.add_node("prepare_context", prepare_context)
    builder.add_node("call_llm", call_llm)
    builder.add_node("safety_check", safety_check)

    builder.add_edge(START, "prepare_context")
    builder.add_edge("prepare_context", "call_llm")
    builder.add_edge("call_llm", "safety_check")
    builder.add_conditional_edges(
        "safety_check",
        should_retry,
        {"call_llm": "call_llm", END: END},
    )

    return builder.compile()
