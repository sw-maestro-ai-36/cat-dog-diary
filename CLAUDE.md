# CLAUDE.md

냥멍일기 — 반려동물 사진 + 키워드 → 1인칭 시점 일기를 자동 생성하는 아카이빙 서비스.

> **응답은 한국어로.** 사용자 글로벌 지침(~/.claude/CLAUDE.md) 우선.

## 바로 가기

- 기획: `docs/DESIGN.md` (§1 서비스 정의·범위만 — 아키텍처 재정의 중)
- 결정 기록: `docs/ADR/` (왜 그렇게 정했는지)
- 메모리 인덱스: `.claude/memory/INDEX.md`
- 도메인 규칙: `.claude/rules/` (프롬프트, RLS, 비용, 톤)

## 핵심 스택 (요약)

Next.js (Vercel) ↔ Supabase (Auth/PG/Storage) ↔ FastAPI + LangGraph ↔ OpenAI GPT-4o-mini (Vision).
상세 근거는 `docs/ADR/` 참조.

## 작업 시 지키는 4가지

1. **스코프 외 변경 금지** — 인접 리팩터링·추측성 추상화 X. 예외: ADR에 명시된 인터페이스.
2. **검증 가능한 목표 선언** — 작업 시작 전 성공 기준 1줄 ("X 호출 → Y 응답 확인").
3. **PII/보안** — 사진은 서명 URL, API 키는 게이트웨이만 보유, 로깅에 원문 금지.
4. **비용 가드레일** — 사용자당 일 8회(신규 5 + 재생성 3) 서버 enforcement.

## 디렉토리 (예정)

```
apps/{web,ai-gateway}/   packages/shared-types/   supabase/{migrations,seed.sql}   docs/   .claude/
```

각 `apps/*/CLAUDE.md`는 그 디렉토리 작업 시 자동 로드 (구현 시 채움).

## 명령어 (구현 후 채움)

구현 시작 후 채울 것.
