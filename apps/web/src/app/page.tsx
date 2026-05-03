import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SignOutButton } from "./sign-out-button";

export default async function Home() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // proxy.ts가 미인증 시 redirect하지만, 이중 가드.
  if (!user) {
    redirect("/login");
  }

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
          <CardTitle>로그인 확인</CardTitle>
          <CardDescription>
            Phase 4-B 검증용. Phase 4-D에서 메인(펫 row)으로 교체.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm">
            <span className="text-muted-foreground">이메일</span>{" "}
            <span className="font-medium">{user.email}</span>
          </p>
          <SignOutButton />
        </CardContent>
      </Card>
    </main>
  );
}
