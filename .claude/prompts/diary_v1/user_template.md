user 메시지 템플릿. gateway가 모드(`generate` / `regenerate`)와 `regen_feedback` 유무로 A/B/C 중 1개를 선택해 조립한다.

사진은 user 메시지의 **별도 image_url 콘텐츠 블록**으로 첨부된다 (Vision API). 본 템플릿에는 사진을 텍스트로 묘사하지 않는다 — 모델이 image_url을 직접 본다.

placeholder marker: `{{ ... }}`. 비어있을 수 있는 블록은 builder가 빈 문자열·`(없음)` 등으로 안전하게 대체한다.

---

## 공통 머리말 (모든 모드에 prepend)

```
사용자 키워드:
{{ keywords }}

최근 일기 (참고용, 직전 3건까지):
{{ recent_diaries_block }}
```

`recent_diaries_block`은 비어있으면 `(없음)` 한 줄. 있으면 다음 형식 중 하나:

```
1. <diary_text 1>
2. <diary_text 2>
3. <diary_text 3>
```

최근 일기는 **연속성 표현 참고용**이다. 직전 일기를 그대로 옮겨 쓰면 안 된다.

---

## 모드 A — 첫 생성 (seq = 1)

조건: `previous_diary_text == None`, `regen_feedback == None`.

공통 머리말 다음에 한 줄:

```
위 키워드와 사진을 바탕으로 일기를 써.
```

---

## 모드 B — 재생성 + 사용자 피드백 있음

조건: `seq >= 2`, `previous_diary_text != None`, `regen_feedback`이 비어있지 않음.

공통 머리말 다음에:

```
이전 시도:
{{ previous_diary_text }}

사용자 피드백:
{{ regen_feedback }}

사용자 피드백을 진실로 두고 그것을 반영해 다시 써. 이전 시도와 정확히 같은 문장은 쓰지 마.
```

---

## 모드 C — 재생성 + 피드백 없음

조건: `seq >= 2`, `previous_diary_text != None`, `regen_feedback`이 비어있거나 `None`.

공통 머리말 다음에:

```
이전 시도:
{{ previous_diary_text }}

같은 입력으로 톤만 약간 다르게 다시 써. 이전과 정확히 같은 문장은 피하되, 인위적으로 크게 비틀지는 마.
```

"약간 다르게" 강도는 약하다 — ADR-0005 부록 정합. 사용자가 명시적으로 다른 방향을 요구하지 않은 상태이므로 큰 변형은 오히려 손해.

---

## 변경 이력

- 2026-05-03 v1: 최초 작성. ADR-0005 부록 4 노드 / 3 모드 정합.
