# Git Commit Convention

냥멍일기 프로젝트의 커밋 메시지 규칙. **불변 룰** — 어기지 말 것.

## 형식

```
<type>: <한국어 한 줄 요약>

- (선택) 상세 항목 1
- (선택) 상세 항목 2
```

- **Subject**: `<type>:` 다음에 한국어로 핵심 내용을 한 줄 요약
- **Body**: 상세 서술이 필요한 경우에만, 빈 줄 한 칸 띄우고 `-` 리스트로 간결하게
- 본문이 불필요한 단순 변경이면 한 줄로 끝낼 것

## Type (7종, 그 외 사용 금지)

- `feat` — 신규 기능
- `fix` — 버그 수정
- `docs` — 문서 (DESIGN.md, ADR, CLAUDE.md, README 등)
- `chore` — 빌드/설정/의존성 (tsconfig, package.json, lint 설정 등)
- `refactor` — 동작 변경 없는 구조 개선
- `test` — 테스트 추가/수정
- `style` — 포맷팅 (코드 동작 무관)

`perf`, scope 표기, breaking change(`!`) **사용하지 않는다.**

## 커밋 단위

- **1 commit = 1 논리적 변경.** ROADMAP의 sub-step 단위 권장.
- 무관한 변경을 한 커밋에 섞지 말 것. 각각 분리.

## 작성 시 금지

- `Co-Authored-By` trailer 추가 금지 (Claude가 작성해도 미포함).
- `--no-verify` 등 훅 우회 금지.
- 본문에 PII/원문 사진 URL/API 키 노출 금지.

## 예시

**기본 (한 줄)**
```
feat: 사진 업로드 폼 컴포넌트 추가
```

**상세 서술이 있는 경우**
```
feat: AI 게이트웨이 일기 생성 엔드포인트 추가

- POST /diary/generate: 사진 URL + 키워드 받아 GPT-4o-mini 호출
- LangGraph 노드 3단계 (vision → tone → format) 구성
- 일일 호출 횟수 검증은 web 레이어에서 처리하므로 미포함
```

```
fix: 일일 호출 횟수 카운트가 자정에 리셋되지 않는 문제 수정
```

```
docs: ADR-0005 Storage 버킷 레이아웃 추가
```
