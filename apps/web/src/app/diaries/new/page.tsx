import Link from "next/link";
import { redirect } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// 4-E 구현 전 placeholder. /diaries/new?pet_id=xxx 진입 시 404 방지.
// 실제 일기 생성 흐름은 4-E에서.
export default async function NewDiaryPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <main className="flex flex-1 flex-col items-center gap-6 p-6">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col gap-4 px-6 py-8 text-center">
          <span className="text-4xl">🚧</span>
          <div className="flex flex-col gap-1">
            <h1 className="text-lg font-semibold">일기 만들기는 준비 중이에요</h1>
            <p className="text-sm text-muted-foreground">
              사진 업로드와 AI 일기 생성은 곧 열려요.
            </p>
          </div>
          <Link href="/" className={buttonVariants({ variant: "outline" })}>
            메인으로 돌아가기
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
