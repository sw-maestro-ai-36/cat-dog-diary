"""LangGraph 조립. ADR-0005 부록 토폴로지 정합.

START → prepare_context → call_llm → safety_check → (conditional)
                                                     ├─ violation && retry < max → call_llm
                                                     └─ else → END
"""
from functools import lru_cache
from typing import Any

from langgraph.graph import END, START, StateGraph

from .nodes import call_llm, prepare_context, safety_check, should_retry
from .state import DiaryState


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
