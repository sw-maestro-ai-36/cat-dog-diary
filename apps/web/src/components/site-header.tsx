import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/brand-logo";

interface SiteHeaderProps {
  /** 우측 액션 영역 (선택). 없으면 brand만 노출. */
  actions?: ReactNode;
  /** 가운데 nav의 "새 일기" 링크가 가리킬 펫 ID. 펫 0마리면 nav에서 hide. */
  newDiaryPetId?: string;
}

export function SiteHeader({ actions, newDiaryPetId }: SiteHeaderProps) {
  return (
    <header className="w-full border-b border-border/40 bg-card/70">
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-3 px-6 py-6 sm:px-10">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-3 whitespace-nowrap text-primary"
        >
          <BrandLogo className="size-11" />
          <span
            className="text-2xl tracking-tight text-foreground"
            style={{
              fontFamily: "Cafe24SsurroundAir, var(--font-pretendard)",
              fontWeight: 600,
            }}
          >
            냥멍일기
          </span>
        </Link>

        <nav className="hidden items-center gap-10 text-lg sm:flex">
          <Link
            href="/"
            className="text-foreground hover:text-primary transition-colors"
          >
            메인
          </Link>
          {newDiaryPetId ? (
            <Link
              href={{
                pathname: "/diaries/new",
                query: { pet_id: newDiaryPetId },
              }}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              새 일기
            </Link>
          ) : null}
          <Link
            href="/pets/new"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            새 펫
          </Link>
        </nav>

        {actions ? (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        ) : null}
      </div>
    </header>
  );
}
