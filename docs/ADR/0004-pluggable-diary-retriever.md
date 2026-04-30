# ADR-0004: DiaryRetriever 인터페이스 추상화

- **상태**: Accepted
- **날짜**: 2026-05-01

## Context

일기 생성 시 "최근 일기 N개를 참조"하여 연속성 표현 ("어제도 산책했는데 또~")을 만든다.

MVP는 단순히 **시간순 최근 3개**를 가져오면 충분.
하지만 일기 수가 누적되면 (수백~수천 건) 시간순 fetch는 한계:
- 작년 같은 날 일기와 비슷한 사건 → 더 적절한 참조
- 의미적으로 유사한 과거 일기 (산책 키워드와 산책 일기 매칭)

따라서 추후 **RAG (pgvector + 임베딩 유사도 검색)** 으로 전환할 가능성이 높음.

문제: 워크플로우 노드 코드에서 직접 SQL을 짜면, 전환 시 노드를 다시 건드려야 하고 회귀 위험 ↑.

## Decision

**`DiaryRetriever`라는 단일 인터페이스를 정의하고, MVP는 `RecentNRetriever`, 추후 `SemanticRetriever`로 swap한다.**

```python
class DiaryRetriever(Protocol):
    async def fetch(
        self,
        pet_id: str,
        today_keywords: str,
        limit: int = 3,
    ) -> list[Diary]: ...
```

- LangGraph `build_context` 노드는 DI로 retriever를 주입받음
- 노드 코드 변경 없이 구현체 교체 가능
- DB 스키마: `diary_embeddings` 테이블을 MVP에 미리 정의 (비활성), pgvector 확장 사전 활성화

## Rationale

- **노드 코드의 안정성** 확보 — 가장 민감한 프롬프트 노드를 retriever 변경으로 인해 다시 검증할 필요 없음
- **무중단 전환** 가능 — feature flag로 일부 사용자에게만 SemanticRetriever 활성 → 비교 → 전면
- **테스트 용이** — Mock retriever로 노드 단위 테스트
- 추상화 비용이 낮음 — Protocol 1개 + 구현체 클래스 1개. 추측성 추상화의 흔한 함정에 빠지지 않음

## Alternatives Considered

### MVP는 노드에 직접 SQL, 전환 시 일괄 리팩터링
- 즉시 단순
- **탈락 이유**: 전환 타이밍에 부담 집중. 프롬프트 회귀 + 데이터 백필 + 코드 변경이 한 번에 발생

### LangChain `BaseRetriever` 상속
- 표준에 맞음
- **탈락 이유**: 일기는 LangChain의 `Document` 추상화에 잘 안 맞음 (메타데이터가 풍부). 자체 Protocol이 더 깔끔

### 처음부터 SemanticRetriever로 시작
- 미래 일치
- **탈락 이유**: 일기 0개부터 시작하므로 임베딩이 무의미. 백필 인프라 + 평가셋 부재로 품질 검증 불가. **지금 만들 가치 없음**

## Consequences

### Pros
- RAG 전환을 **국지적 변경**으로 만듦 — 노드 코드 변경 없음
- 테스트하기 쉬운 노드 코드 (mock retriever)
- 미래의 다양한 retrieval 전략 (시간 + 의미 하이브리드 등) 시험 용이

### Cons
- 추상화 1개 추가 (작긴 함)
- "쓰지도 않을 인터페이스 같다"는 인상 — 사용 시점까지 학습 비용

### 후속 조치
- MVP: `RecentNRetriever` 구현 + 노드 통합
- DB: `diary_embeddings` 테이블 정의 (DDL만), `create extension vector` 사전 적용
- RAG 전환 단계는 별도 ADR로 작성 (전환 결정 시)
