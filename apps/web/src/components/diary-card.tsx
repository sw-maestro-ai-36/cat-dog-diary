"use client";

import { useState } from "react";
import type { Diary } from "@cat-dog-diary/shared-types";
import { DiaryDetailDialog } from "@/components/diary-detail-dialog";
import { MOOD_COLOR_VAR } from "@/lib/mood";

interface DiaryCardProps {
  diary: Diary;
}

const DATE_FMT = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  month: "short",
  day: "numeric",
});

export function DiaryCard({ diary }: DiaryCardProps) {
  const [open, setOpen] = useState(false);
  const dateLabel = DATE_FMT.format(new Date(diary.created_at));

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group/diary-card flex w-56 shrink-0 flex-col gap-2 overflow-hidden rounded-2xl border border-border/40 bg-card text-left text-card-foreground shadow-md ring-1 ring-foreground/5 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none"
        aria-label={`${diary.short_caption} 자세히 보기`}
      >
        <div className="relative aspect-square w-full overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={diary.photo_signed_url}
            alt={diary.short_caption}
            className="h-full w-full object-cover transition-transform duration-300 group-hover/diary-card:scale-[1.02]"
          />
          <span className="absolute top-2 right-2 inline-flex items-center gap-1.5 rounded-full bg-background/95 px-2.5 py-1 text-xs font-medium shadow-sm backdrop-blur-sm">
            <span
              className="size-1.5 rounded-full"
              style={{ backgroundColor: MOOD_COLOR_VAR[diary.mood_tag] }}
              aria-hidden
            />
            {diary.mood_tag}
          </span>
        </div>
        <div className="flex flex-col gap-1 px-3 pb-3">
          <p className="line-clamp-2 text-sm leading-snug font-medium">
            {diary.short_caption}
          </p>
          <span className="text-xs text-muted-foreground">
            {dateLabel}
          </span>
        </div>
      </button>

      <DiaryDetailDialog diary={diary} open={open} onOpenChange={setOpen} />
    </>
  );
}
