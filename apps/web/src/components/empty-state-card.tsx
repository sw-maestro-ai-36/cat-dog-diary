import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function EmptyStateCard() {
  return (
    <Card className="w-full max-w-lg">
      <CardContent className="flex flex-col items-center gap-5 px-8 py-10 text-center">
        <Image
          src="/empty-pets.png"
          alt=""
          width={669}
          height={373}
          priority
          className="h-auto w-full max-w-md"
        />
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold tracking-tight">
            첫 펫을 만나러 가요
          </h2>
          <p className="text-base text-muted-foreground">
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
