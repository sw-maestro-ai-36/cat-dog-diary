import { forwardRef } from "react";
import type { Diary } from "@cat-dog-diary/shared-types";
import { MOOD_COLOR_VAR } from "@/lib/mood";
import styles from "./sns-image-canvas.module.css";

interface SnsImageCanvasProps {
  diary: Diary;
  petName: string;
}

const DATE_FMT = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "long",
  day: "numeric",
});

function diaryTextClass(len: number): string {
  if (len <= 220) return styles.diaryTextShort;
  if (len <= 320) return styles.diaryTextMid;
  return styles.diaryTextLong;
}

export const SnsImageCanvas = forwardRef<HTMLDivElement, SnsImageCanvasProps>(
  function SnsImageCanvas({ diary, petName }, ref) {
    const dateLabel = DATE_FMT.format(new Date(diary.created_at));

    return (
      <div ref={ref} className={styles.canvas}>
        <div className={styles.photo}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={diary.photo_signed_url}
            alt={diary.short_caption}
            crossOrigin="anonymous"
          />
          <div className={styles.petChip}>
            <span className={styles.petChipIcon}>🐾</span>
            <span>{petName}</span>
          </div>
        </div>

        <div className={styles.textArea}>
          <div className={styles.metaRow}>
            <div className={styles.moodPill}>
              <span
                className={styles.moodDot}
                style={{ backgroundColor: MOOD_COLOR_VAR[diary.mood_tag] }}
              />
              <span>{diary.mood_tag}</span>
            </div>
            <div className={styles.date}>{dateLabel}</div>
          </div>

          <h1 className={styles.caption}>{diary.short_caption}</h1>

          <p className={`${styles.diaryText} ${diaryTextClass(diary.diary_text.length)}`}>
            {diary.diary_text}
          </p>

          <div className={styles.watermark}>🐾 냥멍일기</div>
        </div>
      </div>
    );
  },
);
