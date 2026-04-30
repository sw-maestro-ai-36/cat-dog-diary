# Roadmap

> Phase별 체크리스트. 상세 설계 근거는 `docs/DESIGN.md`, 결정 근거는 `docs/ADR/`.
> Phase 종료 시 `.claude/memory/snapshots/phase-{N}-*.md`에 동결 스냅샷 작성.

## Phase 0 — Foundation (예상 1주)

- [ ] 모노레포 셋업 (Turborepo or pnpm workspace)
- [ ] Supabase 프로젝트 생성, Google OAuth provider 설정
- [ ] Next.js 부트스트랩 + Supabase 연동
- [ ] FastAPI 부트스트랩 + uv 셋업
- [ ] CI (GitHub Actions): lint + type check
- [ ] CLAUDE.md "자주 쓰는 명령어" 섹션 채우기

**검증**: 로컬에서 Google 로그인 → 더미 페이지 표시.

## Phase 1 — Pet Profile (예상 3-4일)

- [ ] `pets` 마이그레이션 + RLS
- [ ] BFF: `POST/GET/PATCH /api/pets`
- [ ] UI: 등록 폼, 목록, 선택기
- [ ] 다견 시 일기 작성 시 반려동물 선택 UI

**검증**: 다견 등록 → 호칭 변경 반영 확인.

## Phase 2 — AI Gateway 골격 (예상 3-4일)

- [ ] LangGraph 5노드 (mock LLM 응답)
- [ ] `DiaryRetriever` 인터페이스 + `RecentNRetriever`
- [ ] `/agent/generate-diary` 엔드포인트
- [ ] LangSmith 트레이싱 연동
- [ ] BFF↔Gateway HMAC 인증

**검증**: curl 더미 입력 → 더미 일기 응답.

## Phase 3 — 진짜 AI 일기 생성 (예상 4-5일)

- [ ] OpenAI GPT-4o-mini Vision 실제 호출
- [ ] 시스템 프롬프트 v1 작성 + `prompt-iterations.md` 첫 항목
- [ ] 평가 셋 5케이스 구축
- [ ] Moderation API 연동
- [ ] 비용 메트릭 기록 (LangSmith + DB)

**검증**: 실제 사진 + 키워드 → 한국어 일기 생성, 4번 다른 톤 확인.

## Phase 4 — 일기 작성 플로우 (예상 4-5일)

- [ ] Storage 버킷 + 업로드 UI (클라이언트 리사이즈 1024px)
- [ ] BFF: `/diaries/generate`, `/regenerate`, `/diaries`
- [ ] 임시 결과 캐시 (Postgres temp row + cleanup)
- [ ] UI: 사진 업로드 → 키워드 → 미리보기 → 재생성/저장
- [ ] 일일 한도 / 재생성 카운트 enforcement (`usage_quotas`)

**검증**: 시나리오 1 (퇴근 후 일기 작성) end-to-end.

## Phase 5 — 피드 (예상 2-3일)

- [ ] `/diaries?petId=&cursor=` cursor 페이지네이션
- [ ] UI: 카드형 피드 + 반려동물 필터 + 무한 스크롤

**검증**: 시나리오 2 (지난 추억 다시 보기).

## Phase 6 — 안정화 & 출시 (예상 3-4일)

- [ ] Sentry 에러 모니터링
- [ ] Rate limit (Upstash) 적용
- [ ] 프로덕션 배포 (Vercel + Fly.io)
- [ ] 부하 테스트 (k6, 100 동시)
- [ ] 프롬프트 회귀 테스트 셋 자동 실행 CI

## Phase 7+ (출시 후) — 2차 기능

- **SNS 공유 카드 (Phase 7)** — Secondary 페르소나(10대 SNS 친화형)의 **핵심 가치**. 출시 후 가장 빠르게 구현할 2차 기능으로 둔다.
- RAG 의미 검색 (Phase 8) — `DiaryRetriever` 구현체 swap
- Kakao/Apple 로그인 (Phase 9)
- 푸시 알림 / 리마인더 (Phase 10)

**MVP 총 예상 기간**: 약 4-5주 (1인 기준).
