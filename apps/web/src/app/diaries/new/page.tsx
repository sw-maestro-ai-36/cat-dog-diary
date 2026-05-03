// /diaries/new — pet_id 가드 + usage today 가드 → NewDiaryClient.
// pet_id 누락 / 다른 사용자 / deleted_at / 한도 0 → / redirect (ADR-0013 §일기 추가 진입).

import { redirect } from "next/navigation";
import type { Pet } from "@cat-dog-diary/shared-types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUsageToday } from "@/lib/server/usage";
import { NewDiaryClient } from "./new-diary-client";

type Props = { searchParams: Promise<{ pet_id?: string }> };

export default async function NewDiaryPage({ searchParams }: Props) {
  const { pet_id } = await searchParams;
  if (!pet_id) redirect("/");

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // RLS가 본인 alive 펫만 노출 → 없으면 redirect.
  const { data: pet } = await supabase
    .from("pets")
    .select("id, name, species, honorific, gender, created_at, updated_at")
    .eq("id", pet_id)
    .maybeSingle();
  if (!pet) redirect("/");

  // 한도 도달 시 페이지 진입 차단 (ADR-0013 §한도 도달 처리).
  const usage = await getUsageToday(supabase);
  if (usage.new_remaining <= 0) redirect("/");

  return (
    <main className="flex flex-1 flex-col items-center p-6 pb-12">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>{pet.name}의 새 일기</CardTitle>
        </CardHeader>
        <CardContent>
          <NewDiaryClient pet={pet as Pet} initialNewRemaining={usage.new_remaining} />
        </CardContent>
      </Card>
    </main>
  );
}
