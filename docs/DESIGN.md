# 냥멍일기 설계서

> 작성일: 2026-05-01
> 상태: MVP 설계 확정안 (1차)

## 0. 목차

1. [서비스 정의 & MVP 범위](#1-서비스-정의--mvp-범위)
2. [Agent 설계 (역할 & 자율성)](#2-agent-설계-역할--자율성) ⭐ 핵심
3. [기술 스택 & 시스템 아키텍처](#3-기술-스택--시스템-아키텍처)
4. [데이터 모델](#4-데이터-모델)
5. [Agentic Workflow (LangGraph)](#5-agentic-workflow-langgraph)
6. [재생성 전략](#6-재생성-전략)
7. [API 설계](#7-api-설계)
8. [비용 & 레이트 리밋](#8-비용--레이트-리밋)
9. [보안 & 프라이버시](#9-보안--프라이버시)
10. [확장성 — RAG로 가는 길](#10-확장성--rag로-가는-길)
11. [단계별 개발 로드맵](#11-단계별-개발-로드맵)
12. [열린 질문 / 결정 보류](#12-열린-질문--결정-보류)

---

## 1. 서비스 정의 & MVP 범위

### 한 줄 정의
**반려동물 사진 + 일과 키워드 → 반려동물 1인칭 시점의 일기**를 자동 생성·아카이빙하는 서비스.

### MVP에 포함되는 것 (✅)
- Google 로그인
- 반려동물 프로필 등록 (다견 가능)
- 사진 업로드(JPG/PNG, ≤10MB) + 키워드(≤1,000자) 입력
- AI 일기 생성 (Vision 멀티모달, 반려동물 1인칭, 한국어)
- 재생성 (최대 3회, 즉 총 4회 생성)
- 최근 3개 일기 참조한 연속성 표현
- 일기 저장 + 카드형 피드 조회 (반려동물별 필터)

### MVP에서 빠지는 것 (❌ → 2차)
- SNS 공유 카드 이미지 export
- 사용자 직접 텍스트 편집
- RAG 기반 의미 검색 (단, **인터페이스만 추상화**해두고 추후 swap)
- Kakao/Apple 로그인
- 푸시 알림, 리마인더

### 비기능 요구사항 (NFR)
- **응답 시간**: 일기 생성 P95 < 8초 (Vision 호출 포함)
- **가용성**: MVP는 99% 목표 (Vercel + Supabase + Fly.io/Railway 기본값)
- **확장성**: 사용자 1만 명 / 일일 일기 5만 건까지는 수직 확장으로 대응
- **비용**: 사용자당 월 LLM 비용 ≤ 200원 가정 (자세한 산정은 §8)

---

## 2. Agent 설계 (역할 & 자율성) ⭐

> 본 서비스의 핵심. **무엇을 하고 / 무엇을 하지 않는지**를 명확히 정의한다.

### 2.1 Agent 정체성

**`DiaryAgent`** — 반려동물 1인칭 일기 작가.

단일 에이전트가 아니라 **LangGraph로 구성된 다단계 워크플로우**이며, 외부에서는 하나의 "Agent"로 호출된다 (`POST /agent/generate-diary`).

### 2.2 Agent의 역할 (구체적)

#### 입력
| 항목 | 형식 | 필수 |
|---|---|---|
| 반려동물 프로필 | `{name, species, honorific, breed?, birthday?, personality_traits?[]}` | Y |
| 오늘 사진 | URL (Supabase Storage 서명 URL) | Y |
| 일과 키워드 | string (≤1,000자) | Y |
| 최근 일기 | `Diary[]` (최근 3개) | N (없을 수도 있음) |
| 보호자 사용자 ID | UUID | Y (로깅용) |

#### 출력
```json
{
  "diary_text": "오늘 예진 누나랑 산책 나갔는데 바람이 너무 좋았당🐾 ...",
  "mood_tag": "행복",
  "short_caption": "산책 너무 좋았던 날",
  "metadata": {
    "model": "gpt-4o-mini",
    "input_tokens": 1234,
    "output_tokens": 187,
    "cost_usd": 0.00021,
    "generation_seq": 1,
    "trace_id": "..."
  }
}
```

#### Agent가 수행하는 정확한 작업 (5단계)

1. **입력 검증 & 정규화** (`validate_input` 노드)
   - 사진 URL 접근 가능성, 파일 크기, MIME 타입 확인
   - 키워드 텍스트 문자수 검증, 위험 패턴(주소·전화번호 등 PII) 마스킹
   - 프로필 필수 필드 누락 시 422 반환
2. **사진 분석** (`analyze_photo` 노드, GPT-4o-mini Vision)
   - 사진을 보고 분위기 / 장소 추정 / 동물의 표정 / 보이는 사물을 구조화된 JSON으로 추출
   - 출력: `{mood, scene, visible_objects[], pet_pose}`
3. **컨텍스트 빌드** (`build_context` 노드)
   - 프로필 + 분석 결과 + 키워드 + 최근 3개 일기를 시스템/유저 프롬프트로 합성
   - 호칭, 성격 키워드를 시스템 프롬프트에 주입
   - **DiaryRetriever 인터페이스를 통해 최근 일기 가져오기 (구현체 swap 가능)**
4. **일기 생성** (`generate_diary` 노드, GPT-4o-mini)
   - JSON 모드로 `{diary_text, mood_tag, short_caption}` 한 번에 생성
5. **안전성 검증** (`safety_check` 노드)
   - OpenAI Moderation API 또는 정규식 기반 후처리
   - 위반 감지 시 `regenerate` 자동 1회 시도, 그래도 실패 시 사용자에게 에러 반환 (재생성 카운트 차감 안 함)

### 2.3 Agent의 자율성 범위 (Autonomy Boundaries)

> **결정 트리**: "이 결정을 Agent가 단독으로 내려도 되는가?"

#### ✅ Agent가 자율적으로 결정하는 것

| 영역 | 자율성 | 예시 |
|---|---|---|
| 일기 톤·문체 | 100% 자율 | 프로필의 성격 키워드를 보고 활발한지 차분한지 판단 |
| 이모지 사용 | 100% 자율 | 사진 분위기에 따라 0~3개 사용 |
| 연속성 표현 추가 | 100% 자율 | "어제도 산책했는데 또~" 식의 표현을 자체 판단으로 삽입 |
| 사진 해석 | 100% 자율 | 사진의 표정/배경을 일기에 반영 |
| 안전성 위반 시 1회 자동 재시도 | 100% 자율 | 사용자 카운트 차감 없이 |
| `mood_tag` 분류 | 100% 자율 | 미리 정의된 enum 중 자체 선택 |

#### ⚠️ Agent가 정책에 따라 거부 / 멈추는 것

| 상황 | 동작 |
|---|---|
| 입력 사진에 사람 얼굴이 주체로 인식됨 | 일기 생성 거부, "반려동물 사진을 올려주세요" 안내 |
| 의학적 증상 키워드 입력 ("토함", "설사", "피") | 일기는 생성하되, **마지막에 "병원 방문 권유" 멘트 자동 추가** (자체 룰) |
| 안전성 위반(혐오/성인/폭력) 감지 | 1회 자동 재시도 → 실패 시 422 반환 |
| 사진 분석 실패 (Vision 응답 없음) | 텍스트 입력만으로 일기 생성 (degraded mode) |

#### ❌ Agent가 절대 하지 않는 것

| 항목 | 이유 |
|---|---|
| DB 직접 쓰기 | 단일 책임 원칙 — 영속화는 Next.js BFF가 담당 |
| 외부 API 호출 (OpenAI 외) | 공격면 최소화 |
| 사용자에게 직접 알림 발송 | 알림은 별도 서비스의 책임 |
| 이전 일기 수정 / 삭제 | 사용자 데이터 무결성 |
| 프로필 자동 갱신 | 프로필은 사용자의 명시적 입력만 |
| 의학적 진단·처방 | 책임 범위 밖, 안전 가드레일 |
| 비용 한도 초과 시 강제 호출 | 레이트 리밋은 BFF에서 차단 |

### 2.4 자율성을 좁게 잡은 이유

- **MVP에 적합한 신뢰도 확보**: 자율성을 넓힐수록 검증 비용↑. 일기 생성이라는 좁은 도메인에서는 "하지 않을 일" 리스트가 명확할수록 사고가 적다.
- **사용자 데이터 안전**: Agent가 DB에 직접 쓰지 않으므로 프롬프트 인젝션으로 인한 데이터 손상 위험을 원천 차단.
- **확장 여지**: 추후 "주간 회고 자동 작성", "기념일 자동 감지" 같은 기능을 추가할 때, 새 노드/그래프를 만드는 방식으로 확장 가능 (현재 Agent 책임 범위는 유지).

---

## 3. 기술 스택 & 시스템 아키텍처

### 3.1 스택 결정 요약

| 영역 | 선택 | 이유 |
|---|---|---|
| 프론트 | Next.js 15 (App Router) + TS | Vercel 배포 매끄러움, Server Actions로 BFF 단순화 |
| BaaS | Supabase | Auth + Postgres + Storage 한 번에. RLS로 권한 관리 간소화 |
| 인증 | Supabase Auth (Google OAuth) | 자체 구축 대비 시간 절약 |
| AI 게이트웨이 | FastAPI + LangChain + LangGraph | 사용자 결정 사항. Python 생태계 |
| LLM | OpenAI GPT-4o-mini | Vision 지원, 한국어 OK, 비용 저렴 |
| 백엔드 의존성 관리 | uv | pip보다 빠르고 재현성 좋음 |
| 배포 | Vercel (web) + Fly.io 또는 Railway (ai-gateway) | 둘 다 Docker 친화적 |
| 옵저버빌리티 | LangSmith (LangGraph 트레이싱) + Sentry | LangSmith는 LangChain 1급 통합 |

### 3.2 컴포넌트 다이어그램

```
┌────────────────┐      ┌──────────────────────┐      ┌─────────────────────┐
│  브라우저      │      │  Next.js (Vercel)    │      │  Supabase           │
│  (Next.js UI)  │◄────►│  - App Router        │◄────►│  - Auth (Google)    │
└────────────────┘      │  - Server Actions    │      │  - Postgres + RLS   │
                        │  - BFF API Routes    │      │  - Storage          │
                        │    (rate limit,      │      │  - pgvector (off)   │
                        │     auth check)      │      └─────────────────────┘
                        └──────┬───────────────┘
                               │ HTTPS (서비스 키)
                               ▼
                        ┌──────────────────────┐      ┌─────────────────────┐
                        │  FastAPI Gateway     │      │  OpenAI API         │
                        │  - LangGraph 실행    │◄────►│  - GPT-4o-mini      │
                        │  - DiaryAgent        │      │  - Vision           │
                        │  - LangSmith trace   │      │  - Moderation       │
                        └──────────────────────┘      └─────────────────────┘
```

### 3.3 흐름 — 일기 생성 1회

1. UI: 사진 업로드 → Supabase Storage 직업로드 (서명 URL 발급)
2. UI: `POST /api/diaries/generate` (Next.js BFF)에 요청
3. BFF: 세션 검증 → 일일 한도 확인 → DB에서 최근 3개 일기 조회 → AI Gateway 호출
4. AI Gateway: LangGraph 실행 → 응답
5. BFF: 결과를 임시 캐시 (Redis 또는 Postgres temp row)에 저장 → UI에 반환 (아직 영속 저장 X)
6. UI: 사용자가 "저장" 버튼 클릭 → BFF가 정식 `diaries` 테이블에 저장
7. UI: "재생성" 버튼 클릭 → 3번부터 재실행, 카운트 차감

### 3.4 환경별 설정

| 환경 | Web 도메인 | AI Gateway | DB |
|---|---|---|---|
| local | localhost:3000 | localhost:8000 | Supabase local stack |
| dev | preview-*.vercel.app | dev-gateway.fly.dev | Supabase dev project |
| prod | nyangmeong.app | gateway.nyangmeong.app | Supabase prod project |

---

## 4. 데이터 모델

### 4.1 ERD (개념)

```
users (Supabase Auth 관리)
  └─ pets (1:N)
       └─ diaries (1:N)
            └─ diary_generations (1:N)  -- 재생성 이력
            └─ diary_embeddings (1:1)   -- RAG용, 추후 활성화
```

### 4.2 테이블 정의

#### `pets`
```sql
create table pets (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid not null references auth.users(id) on delete cascade,
  name            text not null,
  species         text not null check (species in ('dog', 'cat')),
  honorific       text not null check (honorific in ('누나','언니','오빠','형','엄마','아빠')),
  breed           text,                          -- 선택
  birthday        date,                          -- 선택
  personality_traits text[] default '{}',        -- 선택, ['소심','장난꾸러기']
  profile_image_path text,                       -- Storage 경로
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index idx_pets_owner on pets(owner_id);
```

RLS:
```sql
alter table pets enable row level security;
create policy "owner can read"   on pets for select using (owner_id = auth.uid());
create policy "owner can insert" on pets for insert with check (owner_id = auth.uid());
create policy "owner can update" on pets for update using (owner_id = auth.uid());
create policy "owner can delete" on pets for delete using (owner_id = auth.uid());
```

#### `diaries`
```sql
create table diaries (
  id              uuid primary key default gen_random_uuid(),
  pet_id          uuid not null references pets(id) on delete cascade,
  owner_id        uuid not null references auth.users(id) on delete cascade,  -- 비정규화 (RLS 단순화)
  diary_date      date not null,                 -- 일기 대상 날짜 (created_at과 분리 — 사후 입력 가능성)
  photo_path      text not null,                 -- Storage 경로
  user_keywords   text not null,                 -- 사용자 입력 키워드
  diary_text      text not null,                 -- 최종 확정된 일기
  mood_tag        text,                          -- '행복','슬픔','신남','졸림','심심' 등
  short_caption   text,
  generation_seq  smallint not null,             -- 몇 번째 생성본을 채택했는지 (1~4)
  created_at      timestamptz default now()
);

create index idx_diaries_pet_date on diaries(pet_id, diary_date desc);
create index idx_diaries_owner_created on diaries(owner_id, created_at desc);
```

#### `diary_generations` (재생성 이력 — 채택되지 않은 결과 포함)
```sql
create table diary_generations (
  id              uuid primary key default gen_random_uuid(),
  session_id      uuid not null,                 -- 한 번의 일기 작성 세션
  pet_id          uuid not null references pets(id) on delete cascade,
  owner_id        uuid not null references auth.users(id) on delete cascade,
  seq             smallint not null,             -- 1, 2, 3, 4
  diary_text      text not null,
  mood_tag        text,
  short_caption   text,
  input_tokens    int,
  output_tokens   int,
  cost_usd        numeric(10, 6),
  trace_id        text,                          -- LangSmith trace ID
  created_at      timestamptz default now(),
  unique (session_id, seq)
);
```

#### `usage_quotas` (일일 한도 추적)
```sql
create table usage_quotas (
  owner_id        uuid not null references auth.users(id) on delete cascade,
  quota_date      date not null,
  generations_count int not null default 0,      -- 신규 생성 (재생성 제외)
  primary key (owner_id, quota_date)
);
```

#### `diary_embeddings` (RAG 대비, MVP에서는 미사용)
```sql
-- create extension if not exists vector;
-- create table diary_embeddings (
--   diary_id uuid primary key references diaries(id) on delete cascade,
--   embedding vector(1536)
-- );
-- create index on diary_embeddings using hnsw (embedding vector_cosine_ops);
```
> MVP에서는 테이블만 정의하고 비활성. RAG 단계에서 활성화 + 백필.

### 4.3 Storage 버킷

| 버킷 | 용도 | 정책 |
|---|---|---|
| `pet-photos` | 일기 첨부 사진 | private, 서명 URL로만 접근 (TTL 1h) |
| `pet-profiles` | 프로필 이미지 | private |

---

## 5. Agentic Workflow (LangGraph)

### 5.1 그래프 구조

```
                ┌───────────────────┐
START ────────► │  validate_input   │
                └─────────┬─────────┘
                          │
                          ▼
                ┌───────────────────┐
                │  analyze_photo    │  ← GPT-4o-mini Vision
                └─────────┬─────────┘
                          │
                          ▼
                ┌───────────────────┐
                │  build_context    │  ← DiaryRetriever (recent_3 / RAG)
                └─────────┬─────────┘
                          │
                          ▼
                ┌───────────────────┐
                │  generate_diary   │  ← GPT-4o-mini (JSON mode)
                └─────────┬─────────┘
                          │
                          ▼
                ┌───────────────────┐         조건부
                │  safety_check     │ ──── 위반 ────► regenerate (1회 자동, 카운트 차감 X)
                └─────────┬─────────┘
                          │ pass
                          ▼
                       END
```

### 5.2 State 정의

```python
from typing import TypedDict, Optional
from langchain_core.messages import BaseMessage

class DiaryState(TypedDict):
    # 입력
    pet_profile: dict
    photo_url: str
    user_keywords: str
    recent_diaries: list[dict]
    owner_id: str
    session_id: str
    seq: int  # 1~4

    # 중간 산물
    photo_analysis: Optional[dict]      # analyze_photo 결과
    composed_messages: Optional[list[BaseMessage]]

    # 출력
    diary_text: Optional[str]
    mood_tag: Optional[str]
    short_caption: Optional[str]

    # 메타
    safety_retry_count: int
    cost_usd: float
    input_tokens: int
    output_tokens: int
    trace_id: Optional[str]
```

### 5.3 노드별 책임

#### `validate_input`
- Pydantic 모델로 입력 검증
- 사진 URL HEAD 요청으로 접근 가능성 확인
- 실패 시 `ValueError` 발생 → FastAPI에서 422

#### `analyze_photo`
- GPT-4o-mini Vision 호출 (JSON mode)
- 시스템 프롬프트: "이 사진을 객관적으로 묘사하라. 다음 JSON 스키마로 응답: ..."
- 실패 시 빈 dict 반환 (degraded mode 진입)

#### `build_context`
- 시스템 프롬프트 합성:
  ```
  너는 {pet.name}({pet.species})이다.
  보호자를 '{honorific}'(이)라고 부른다.
  성격: {personality_traits}
  반려동물 1인칭으로 한국어 일기를 써라. 200~400자.
  최근 일기 참조 가능 시 자연스럽게 연속성 표현 사용.
  의학적 조언 금지.
  ```
- 유저 프롬프트: 키워드 + 사진 분석 + 최근 3개 일기 요약

#### `generate_diary`
- GPT-4o-mini, JSON mode, response_format=`{type: "json_schema", schema: {...}}`
- 출력: `{diary_text, mood_tag, short_caption}`

#### `safety_check`
- OpenAI Moderation API 호출 (저비용)
- 카테고리 체크: hate, harassment, sexual, violence
- 위반 + `safety_retry_count == 0` → `safety_retry_count += 1`, generate_diary로 루프
- 위반 + `safety_retry_count == 1` → `END` (에러 상태로)
- 통과 → `END`

### 5.4 노드 별 사용 모델 (현재 / 향후)

| 노드 | 현재 (MVP) | 향후 옵션 |
|---|---|---|
| analyze_photo | GPT-4o-mini Vision | 없음 (변경 시 4o로 업그레이드) |
| generate_diary | GPT-4o-mini | 4o (품질 더 필요할 때) |
| safety_check | Moderation API (별도) | 동일 |

---

## 6. 재생성 전략

### 6.1 카운트 모델

```
일기 작성 세션 시작 → 1차 생성 (count: 0/3 사용 안 함)
사용자가 "재생성" 클릭 → 2차 (3/3 → 2/3)
사용자가 "재생성" 클릭 → 3차 (2/3 → 1/3)
사용자가 "재생성" 클릭 → 4차 (1/3 → 0/3, 더 이상 재생성 불가)
사용자가 "저장" 클릭 → diaries 테이블에 채택본 저장, generations은 모두 보존
```

### 6.2 다양성 확보 — 재생성마다 변화 주는 방법

같은 입력으로 4번 호출하면 비슷한 결과만 나오기 쉬움. 차별화 전략:

1. **`temperature` 점진 상승**: 1차 0.7 → 2차 0.85 → 3차 1.0 → 4차 1.1
2. **시스템 프롬프트에 variation 힌트 주입**: "이전 시도와 다른 톤으로 작성. 이번엔 [감성적/장난스러운/짧고 임팩트 있는] 톤"
3. **이전 generation 텍스트를 negative example로 첨부**: "다음과 비슷한 시작/끝맺음은 피하라: [...]"

> 구현은 `generate_diary` 노드가 `seq` 값을 보고 자체 분기.

### 6.3 사용자 한도

- 일일 **신규 생성 5회** (재생성은 카운트 X)
- 한 세션당 **재생성 최대 3회** (총 4번 생성)
- 안전성 위반으로 인한 자동 재시도는 **카운트 차감 안 함**
- 한도 초과 시: BFF에서 429 반환, UI에서 "내일 다시 만나요🐾" 메시지

---

## 7. API 설계

### 7.1 BFF (Next.js) → 클라이언트

| Method | Path | 설명 |
|---|---|---|
| POST | `/api/pets` | 반려동물 등록 |
| GET | `/api/pets` | 내 반려동물 목록 |
| PATCH | `/api/pets/:id` | 프로필 수정 |
| POST | `/api/diaries/generate` | 일기 생성 (저장 X, 임시 결과 반환) |
| POST | `/api/diaries/regenerate` | 재생성 |
| POST | `/api/diaries` | 채택본 저장 |
| GET | `/api/diaries?petId=&cursor=` | 피드 조회 (cursor pagination) |
| GET | `/api/usage/today` | 오늘 남은 생성 횟수 |

### 7.2 Next.js BFF → AI Gateway

| Method | Path | 인증 |
|---|---|---|
| POST | `/agent/generate-diary` | 서비스 토큰 (HMAC 또는 정적 시크릿) |

요청:
```json
{
  "session_id": "uuid",
  "seq": 1,
  "owner_id": "uuid",
  "pet_profile": { ... },
  "photo_url": "https://supabase-storage.../signed?...",
  "user_keywords": "산책 30분, 닭가슴살 간식",
  "recent_diaries": [ ... ]
}
```

응답: §2.2의 출력 스키마와 동일.

---

## 8. 비용 & 레이트 리밋

### 8.1 비용 산정 (대략)

| 호출 | 입력 토큰 | 출력 토큰 | 회당 비용 (4o-mini) |
|---|---|---|---|
| analyze_photo (사진 1024px + 지시) | ~1,000 (이미지 포함) | ~150 | $0.0003 |
| generate_diary (프로필 + 키워드 + 최근 3개) | ~1,500 | ~300 | $0.0004 |
| safety_check | (Moderation API 무료) | - | $0 |
| **총 1회 생성** | | | **~$0.0007** |
| 사용자당 일일 최대 (8회) | | | **~$0.006 (~9원)** |

> GPT-4o-mini 가격: input $0.15/1M, output $0.60/1M (2026-05 기준 가정).

### 8.2 레이트 리밋

| 레이어 | 한도 | 구현 |
|---|---|---|
| 사용자 일일 신규 생성 | 5회 | `usage_quotas` 테이블 |
| 사용자 세션당 재생성 | 3회 | `diary_generations.seq` 카운트 |
| IP당 분당 요청 | 30 | Vercel Edge Middleware (Upstash Ratelimit) |
| AI Gateway → OpenAI 동시성 | 10 (초기) | asyncio Semaphore |

---

## 9. 보안 & 프라이버시

- **사진**: Storage는 private. 서버에서 단기 서명 URL(1h) 발급해 LLM에 전달.
- **PII 마스킹**: 키워드 입력에 전화번호/주소 패턴 발견 시 클라이언트에서 경고.
- **OpenAI 학습 미사용**: API 키는 zero-retention 옵션이 있는 워크스페이스에서 발급 (Console 설정 확인 필수).
- **RLS**: 모든 테이블에 owner 기반 RLS. 서비스 키는 AI Gateway에서만 사용.
- **AI Gateway 인증**: BFF→Gateway는 HMAC 서명 헤더 + IP 화이트리스트(가능 시).
- **로깅**: 사진 URL/키워드/일기 텍스트는 trace_id로만 식별. 개인정보 직접 로그 금지.
- **삭제 요청**: 사용자가 계정 삭제 시 `auth.users` cascade로 모든 데이터 삭제. Storage 객체는 별도 cleanup job.

---

## 10. 확장성 — RAG로 가는 길

### 10.1 인터페이스 추상화 (MVP에 미리 구현)

```python
# apps/ai-gateway/app/retrievers/base.py
from typing import Protocol

class DiaryRetriever(Protocol):
    async def fetch(
        self,
        pet_id: str,
        today_keywords: str,
        limit: int = 3,
    ) -> list[dict]: ...
```

```python
# MVP 구현
class RecentNRetriever:
    def __init__(self, supabase_client): ...
    async def fetch(self, pet_id, today_keywords, limit=3):
        # diaries 테이블에서 최근 N개 가져오기
        ...
```

```python
# 추후 RAG 구현
class SemanticRetriever:
    def __init__(self, supabase_client, openai_client): ...
    async def fetch(self, pet_id, today_keywords, limit=3):
        # today_keywords 임베딩 → diary_embeddings에서 cosine 유사도 top-k
        ...
```

`build_context` 노드는 `DiaryRetriever`를 DI로 받아 사용. **노드 코드는 변경 없이 구현체만 swap 가능.**

### 10.2 RAG 전환 단계 (실제 진행 시)

1. `pgvector` 확장 활성화 (Supabase Dashboard → Database → Extensions)
2. `diary_embeddings` 테이블 활성화
3. 신규 일기 저장 시 embedding 백필 (write-through)
4. 기존 일기 백필 작업 (1회성 batch)
5. `SemanticRetriever` 구현
6. Feature flag로 일부 사용자에게만 활성화 → 품질 비교
7. 전면 전환

> 데이터 마이그레이션이 필요 없어서 **무중단 전환 가능**.

---

## 11. 단계별 개발 로드맵

### Phase 0 — Foundation (1주)
- [ ] 모노레포 설정 (Turborepo or pnpm workspace)
- [ ] Supabase 프로젝트 생성, Auth(Google) 설정
- [ ] Next.js 프로젝트 부트스트랩 + Supabase 연동
- [ ] FastAPI 프로젝트 부트스트랩 + uv 설정
- [ ] CI (GitHub Actions): lint + type check
- **검증**: 로컬에서 Google 로그인 → 더미 페이지 표시

### Phase 1 — Pet Profile (3-4일)
- [ ] `pets` 마이그레이션 + RLS
- [ ] BFF: `POST/GET/PATCH /api/pets`
- [ ] UI: 반려동물 등록 폼, 목록, 선택기
- **검증**: 다견 등록 → 목록 표시 → 호칭 변경 반영

### Phase 2 — AI Gateway 골격 (3-4일)
- [ ] LangGraph 5노드 구현 (mock LLM 응답)
- [ ] `DiaryRetriever` 인터페이스 + `RecentNRetriever` 구현
- [ ] `/agent/generate-diary` 엔드포인트
- [ ] LangSmith 트레이싱 연동
- **검증**: curl로 더미 입력 → 더미 일기 응답

### Phase 3 — 진짜 AI 일기 생성 (4-5일)
- [ ] OpenAI 키 + 4o-mini Vision 호출 실제 구현
- [ ] 시스템 프롬프트 튜닝 (수동 평가 5케이스)
- [ ] Moderation API 연동
- [ ] 비용 메트릭 기록
- **검증**: 실제 사진 + 키워드 → 한국어 일기 4개 생성 → 톤 차이 확인

### Phase 4 — 일기 작성 플로우 (4-5일)
- [ ] Storage 버킷 + 업로드 UI
- [ ] BFF: `/api/diaries/generate` `/regenerate` `/diaries`
- [ ] 임시 결과 캐시 (Postgres temp row + cleanup job)
- [ ] UI: 사진 업로드 → 키워드 → 결과 미리보기 → 재생성/저장
- [ ] 일일 한도 / 재생성 카운트 enforcement
- **검증**: 시나리오 1 (퇴근 후 일기 작성) end-to-end 통과

### Phase 5 — 피드 (2-3일)
- [ ] `/api/diaries?petId=&cursor=` cursor 페이지네이션
- [ ] UI: 카드형 피드 + 반려동물 필터 + 무한 스크롤
- **검증**: 시나리오 2 (지난 추억 다시 보기) 통과

### Phase 6 — 안정화 & 출시 (3-4일)
- [ ] Sentry 에러 모니터링
- [ ] Rate limit (Upstash) 적용
- [ ] 프로덕션 배포 (Vercel + Fly.io)
- [ ] 부하 테스트 (k6, 100 동시)
- [ ] 프롬프트 회귀 테스트 셋 구축

### Phase 7+ (출시 후) — 2차 기능
- SNS 공유 카드 (Phase 7)
- RAG 의미 검색 (Phase 8) — §10.2 절차 따름
- Kakao/Apple 로그인 (Phase 9)
- 푸시 알림 / 리마인더 (Phase 10)

**예상 MVP 총 기간**: 약 4-5주 (1인 기준).

---

## 12. 열린 질문 / 결정 보류

- [ ] 임시 생성 결과 캐시: Postgres temp row vs Redis. **MVP는 Postgres**로 단순화 제안.
- [ ] AI Gateway 배포 호스팅: Fly.io vs Railway vs Render. 트래픽 패턴 보고 결정.
- [ ] LangSmith 무료 한도 한계 시 자체 OpenTelemetry로 갈지.
- [ ] 사진 리사이즈 위치: 클라이언트(브라우저 Canvas) vs Supabase Edge Function vs AI Gateway. **MVP는 클라이언트** 제안 (대역폭 절약).
- [ ] 일기 텍스트 길이 강제: 200~400자를 프롬프트에만 의존할지, 후처리로 강제할지.

