# Memory Index

`.claude/memory/`는 Claude가 작업하면서 누적하는 **가변 학습 저장소**.
규칙(불변)은 `.claude/rules/`, 결정(불변)은 `docs/ADR/`에 둔다.

## 파일

- [`prompt-iterations.md`](prompt-iterations.md) — 일기 생성 프롬프트 변경 이력 + 평가 결과. 도메인 핵심 자산.
- [`gotchas.md`](gotchas.md) — 한 번 헤맸던 문제와 해결 (RLS 기벽, 토큰 폭주 등).
- [`snapshots/`](snapshots/) — Phase 종료 시점의 상태 동결. 새 세션 빠른 진입용.

## 규칙

- 새 카테고리가 필요해지면 별도 파일을 만들고 이 인덱스에 한 줄 추가.
- 한 파일이 너무 커지면 분할 (예: `prompt-iterations-v1.md` 아카이브 후 새로 시작).
- 주관적 의견은 적지 말 것 — 변경 / 결과 / 액션만.
