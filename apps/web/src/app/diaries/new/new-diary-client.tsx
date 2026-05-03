"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { MoodTag, Pet } from "@cat-dog-diary/shared-types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  adoptDiary,
  generateDiary,
  regenerateDiary,
} from "@/lib/api/diaries";
import {
  ALLOWED_MIME,
  MAX_PHOTO_SIZE,
  PhotoUploadError,
  uploadPetPhoto,
} from "@/lib/storage/upload";

type Step = "input" | "loading" | "result";

interface ResultState {
  session_id: string;
  generation_id: string;
  diary_text: string;
  short_caption: string;
  mood_tag: MoodTag;
  regenerate_remaining: number;
}

interface NewDiaryClientProps {
  pet: Pet;
  initialNewRemaining: number;
}

export function NewDiaryClient({ pet, initialNewRemaining }: NewDiaryClientProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("input");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [photoPath, setPhotoPath] = useState<string | null>(null);
  const [keywords, setKeywords] = useState("");
  const [result, setResult] = useState<ResultState | null>(null);
  const [feedback, setFeedback] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [adopting, setAdopting] = useState(false);

  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!ALLOWED_MIME.includes(f.type as (typeof ALLOWED_MIME)[number])) {
      toast.error("JPG 또는 PNG만 지원해요");
      e.target.value = "";
      return;
    }
    if (f.size > MAX_PHOTO_SIZE) {
      toast.error("사진은 10MB 이하여야 해요");
      e.target.value = "";
      return;
    }
    setFile(f);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(f));
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      toast.error("사진을 선택해주세요");
      return;
    }
    const trimmed = keywords.trim();
    if (trimmed.length < 1 || trimmed.length > 1000) {
      toast.error("키워드는 1~1000자로 입력해주세요");
      return;
    }
    setStep("loading");
    try {
      const path = await uploadPetPhoto(file);
      setPhotoPath(path);
      const res = await generateDiary({
        pet_id: pet.id,
        photo_path: path,
        keywords: trimmed,
      });
      setResult({
        session_id: res.session_id,
        generation_id: res.generation_id,
        diary_text: res.diary_text,
        short_caption: res.short_caption,
        mood_tag: res.mood_tag,
        regenerate_remaining: res.regenerate_remaining,
      });
      setStep("result");
    } catch (err) {
      const msg =
        err instanceof PhotoUploadError
          ? err.message
          : err instanceof Error
            ? err.message
            : "일기 생성 실패";
      toast.error(msg);
      setStep("input");
    }
  }

  async function handleRegenerate() {
    if (!result || !photoPath) return;
    const trimmedFb = feedback.trim();
    if (trimmedFb.length > 500) {
      toast.error("피드백은 500자 이하여야 해요");
      return;
    }
    setStep("loading");
    try {
      const res = await regenerateDiary({
        session_id: result.session_id,
        pet_id: pet.id,
        photo_path: photoPath,
        keywords: keywords.trim(),
        feedback: trimmedFb.length > 0 ? trimmedFb : undefined,
      });
      setResult({
        ...result,
        generation_id: res.generation_id,
        diary_text: res.diary_text,
        short_caption: res.short_caption,
        mood_tag: res.mood_tag,
        regenerate_remaining: res.regenerate_remaining,
      });
      setFeedback("");
      setShowFeedback(false);
      setStep("result");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "재생성 실패");
      setStep("result");
    }
  }

  async function handleAdopt() {
    if (!result) return;
    setAdopting(true);
    try {
      await adoptDiary({ source_generation_id: result.generation_id });
      toast.success("일기를 추가했어요");
      router.replace("/");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "채택 실패");
      setAdopting(false);
    }
  }

  if (step === "loading") {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <span className="text-4xl">🐾</span>
        <p className="text-sm text-muted-foreground">
          일기를 쓰고 있어요... 보통 8초 정도 걸려요.
        </p>
      </div>
    );
  }

  if (step === "result" && result) {
    return (
      <div className="flex flex-col gap-4">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt={result.short_caption}
            className="aspect-square w-full rounded-xl object-cover"
          />
        ) : null}

        <div className="flex flex-col gap-2 rounded-xl bg-muted/30 p-4">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-background px-2 py-0.5 text-xs font-medium ring-1 ring-foreground/10">
              {result.mood_tag}
            </span>
            <span className="text-sm font-medium">{result.short_caption}</span>
          </div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {result.diary_text}
          </p>
        </div>

        {showFeedback ? (
          <div className="flex flex-col gap-2">
            <Label htmlFor="feedback">어떻게 다르게 써볼까요? (선택)</Label>
            <textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              maxLength={500}
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="예: 더 차분한 느낌으로 / 산책 얘기는 빼고"
            />
            <div className="flex gap-2">
              <Button
                onClick={handleRegenerate}
                className="flex-1"
                disabled={adopting}
              >
                다시 만들기 ({result.regenerate_remaining}회 남음)
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowFeedback(false);
                  setFeedback("");
                }}
                disabled={adopting}
              >
                취소
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button
              onClick={handleAdopt}
              disabled={adopting}
              className="flex-1"
            >
              {adopting ? "저장 중..." : "이 일기로 추가"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowFeedback(true)}
              disabled={adopting || result.regenerate_remaining <= 0}
            >
              {result.regenerate_remaining > 0
                ? `다시 만들기 (${result.regenerate_remaining})`
                : "재생성 한도 끝"}
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleGenerate} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="photo">사진</Label>
        <input
          ref={fileInputRef}
          id="photo"
          type="file"
          accept={ALLOWED_MIME.join(",")}
          onChange={handleFileChange}
          className="text-sm"
        />
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="미리보기"
            className="aspect-square w-full rounded-xl bg-muted object-cover"
          />
        ) : (
          <div className="flex aspect-square w-full items-center justify-center rounded-xl bg-muted/40 text-sm text-muted-foreground">
            사진을 선택해주세요 (JPG/PNG, 10MB 이하)
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="keywords">오늘의 키워드</Label>
        <textarea
          id="keywords"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          maxLength={1000}
          rows={4}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder="예: 아침 산책, 처음 본 비둘기에 깜짝, 식빵 굽기"
        />
        <span className="text-xs text-muted-foreground">
          오늘 남은 새 일기 {initialNewRemaining}회
        </span>
      </div>

      <Button type="submit" size="lg">
        일기 만들기
      </Button>
    </form>
  );
}
