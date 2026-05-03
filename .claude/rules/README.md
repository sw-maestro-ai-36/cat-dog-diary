# Rules

**불변 규칙** — Claude가 코드를 쓸 때 절대 어기지 말아야 하는 것.
가변 학습은 `.claude/memory/`로.

## 작성된 룰

- `git-commit.md` — 커밋 메시지 컨벤션 (`<type>: 한국어 한 줄`, scope/perf/Co-Author 미사용)
- `tone-guide.md` — 1인칭 일기 톤 가이드 (cat/dog/other 3섹션 + §0 공통). prompt에 species 분기로 1섹션만 inject

## 예정 파일 (Phase 0 진행하며 채움)

- `prompt-guardrails.md` — 일기 프롬프트 변경 시 가드 (호칭 누락 금지, 의학적 조언 금지 등)
- `rls-policy.md` — Supabase RLS 작성 규칙 (모든 테이블 owner-based)
- `cost-budget.md` — 토큰/비용 한도, 사진 리사이즈 의무

## 룰을 추가하는 기준

- 한 번이라도 어겨서 사고가 났던 것
- ADR이 결정한 원칙의 **운영 형태**
- 사용자가 "이건 절대 X"라고 명시한 것

추측성 룰은 만들지 말 것.
