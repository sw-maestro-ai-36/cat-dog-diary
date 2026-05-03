import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 p-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="text-5xl">🐱🐶</span>
        <h1 className="text-3xl font-semibold tracking-tight">냥멍일기</h1>
        <p className="text-muted-foreground">
          사진 한 장에서 시작하는 반려동물 1인칭 일기
        </p>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>디자인 토큰 확인</CardTitle>
          <CardDescription>
            베이지 배경 · 오렌지 primary · 분홍 accent · radius 1rem · Pretendard
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button>기본 (오렌지)</Button>
          <Button variant="secondary">보조</Button>
          <Button variant="outline">아웃라인</Button>
          <Button variant="ghost">고스트</Button>
          <Button className="bg-accent text-accent-foreground hover:bg-accent/80">
            분홍 accent
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
