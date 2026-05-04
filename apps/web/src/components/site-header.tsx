import Link from "next/link";
import type { ReactNode } from "react";

interface SiteHeaderProps {
  /** 우측 액션 영역 (선택). 없으면 brand만 노출. */
  actions?: ReactNode;
}

export function SiteHeader({ actions }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-10 w-full border-b border-border/40 bg-card/85 shadow-[0_1px_2px_rgba(45,32,24,0.04)] backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 whitespace-nowrap"
        >
          <span className="text-2xl">🐱🐶</span>
          <span className="text-lg font-semibold tracking-tight">냥멍일기</span>
        </Link>
        {actions ? (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        ) : null}
      </div>
    </header>
  );
}
