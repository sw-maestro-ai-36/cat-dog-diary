"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Diary } from "@cat-dog-diary/shared-types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteDiary } from "@/lib/api/diaries";
import { MOOD_COLOR_VAR } from "@/lib/mood";

interface DiaryDetailDialogProps {
  diary: Diary;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FULL_DATE_FMT = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "long",
  day: "numeric",
});

export function DiaryDetailDialog({
  diary,
  open,
  onOpenChange,
}: DiaryDetailDialogProps) {
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const dateLabel = FULL_DATE_FMT.format(new Date(diary.created_at));

  function handleOpenChange(o: boolean) {
    if (deleting) return;
    if (!o) setConfirmDelete(false);
    onOpenChange(o);
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteDiary(diary.id);
      toast.success("일기를 지웠어요");
      onOpenChange(false);
      setConfirmDelete(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "삭제 실패");
      setDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogTitle className="sr-only">{diary.short_caption}</DialogTitle>
        <DialogDescription className="sr-only">{dateLabel}</DialogDescription>

        <div className="flex flex-col gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={diary.photo_signed_url}
            alt={diary.short_caption}
            className="aspect-square w-full rounded-xl bg-muted object-cover"
          />

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-2.5 py-1 text-xs font-medium">
              <span
                className="size-1.5 rounded-full"
                style={{ backgroundColor: MOOD_COLOR_VAR[diary.mood_tag] }}
                aria-hidden
              />
              {diary.mood_tag}
            </span>
            <span className="text-sm font-medium">{diary.short_caption}</span>
            <span className="ml-auto text-xs text-muted-foreground">
              {dateLabel}
            </span>
          </div>

          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {diary.diary_text}
          </p>

          <div className="border-t pt-3">
            {!confirmDelete ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmDelete(true)}
                className="w-full"
              >
                일기 삭제
              </Button>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-sm">정말 지울까요? 되돌릴 수 없어요.</p>
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1"
                  >
                    {deleting ? "삭제 중..." : "삭제 확정"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmDelete(false)}
                    disabled={deleting}
                    className="flex-1"
                  >
                    취소
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
