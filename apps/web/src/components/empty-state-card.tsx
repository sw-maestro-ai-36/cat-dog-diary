import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function EmptyStateCard() {
  return (
    <Card className="w-full max-w-md">
      <CardContent className="flex flex-col items-center gap-4 px-6 py-10 text-center">
        <span className="text-5xl">🐾</span>
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold tracking-tight">
            첫 펫을 만나러 가요
          </h2>
          <p className="text-sm text-muted-foreground">
            이름·종·호칭만 알려주면 일기 시작 준비 끝.
          </p>
        </div>
        <Link
          href="/pets/new"
          className={buttonVariants({ size: "lg", className: "w-full" })}
        >
          + 새 펫 추가
        </Link>
      </CardContent>
    </Card>
  );
}
