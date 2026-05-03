import type { Diary } from "@cat-dog-diary/shared-types";

interface DiaryCardProps {
  diary: Diary;
}

const DATE_FMT = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  month: "short",
  day: "numeric",
});

export function DiaryCard({ diary }: DiaryCardProps) {
  const dateLabel = DATE_FMT.format(new Date(diary.created_at));

  return (
    <article className="group/diary-card flex w-40 shrink-0 flex-col gap-2 overflow-hidden rounded-xl bg-card text-card-foreground ring-1 ring-foreground/10">
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        {/* MVP: <img>로 충분. CDN 최적화는 prod 시점에 별도 ADR. */}
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
        <span className="text-[0.7rem] text-muted-foreground">{dateLabel}</span>
      </div>
    </article>
  );
}
