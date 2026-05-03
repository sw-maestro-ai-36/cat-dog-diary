"use client";

import { useState } from "react";
import type { Diary } from "@cat-dog-diary/shared-types";
import { DiaryDetailDialog } from "@/components/diary-detail-dialog";

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
        className="group/diary-card flex w-40 shrink-0 flex-col gap-2 overflow-hidden rounded-xl bg-card text-left text-card-foreground ring-1 ring-foreground/10 transition-shadow hover:ring-2 hover:ring-primary/30 focus-visible:ring-2 focus-visible:ring-primary"
        aria-label={`${diary.short_caption} 자세히 보기`}
      >
        <div className="relative aspect-square w-full overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={diary.photo_signed_url}
            alt={diary.short_caption}
            className="h-full w-full object-cover"
          />
          <span className="absolute top-1.5 right-1.5 rounded-full bg-background/90 px-2 py-0.5 text-[0.7rem] font-medium ring-1 ring-foreground/10">
            {diary.mood_tag}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 px-2.5 pb-2.5">
          <p className="line-clamp-2 text-xs leading-snug font-medium">
            {diary.short_caption}
          </p>
          <span className="text-[0.7rem] text-muted-foreground">
            {dateLabel}
          </span>
        </div>
      </button>

      <DiaryDetailDialog diary={diary} open={open} onOpenChange={setOpen} />
    </>
  );
}
