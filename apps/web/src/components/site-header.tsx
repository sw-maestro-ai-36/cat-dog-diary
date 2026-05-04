import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/brand-logo";

interface SiteHeaderProps {
  /** 우측 액션 영역 (선택). 없으면 brand만 노출. */
  actions?: ReactNode;
}

export function SiteHeader({ actions }: SiteHeaderProps) {
  return (
    <header className="w-full border-b border-border/40 bg-card/40 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 whitespace-nowrap text-primary"
        >
          <BrandLogo className="size-10" />
          <span
            className="text-xl tracking-tight text-foreground"
            style={{
              fontFamily: "Cafe24SsurroundAir, var(--font-pretendard)",
              fontWeight: 600,
            }}
          >
            냥멍일기
          </span>
        </Link>
        {actions ? (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        ) : null}
      </div>
    </header>
  );
}
