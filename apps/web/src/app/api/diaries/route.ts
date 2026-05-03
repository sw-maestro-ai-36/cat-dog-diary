import { NextResponse, type NextRequest } from "next/server";
import type { ListDiariesResponse } from "@cat-dog-diary/shared-types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { errorResponse } from "@/lib/api/error";
import { listDiariesForPet } from "@/lib/server/diaries";

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return errorResponse("UNAUTHENTICATED", "로그인이 필요합니다");

  const { searchParams } = new URL(request.url);
  const petId = searchParams.get("petId");
  if (!petId) {
    return errorResponse("VALIDATION_FAILED", "petId 쿼리 파라미터가 필요합니다");
  }

  const cursor = searchParams.get("cursor") ?? undefined;
  const limitRaw = searchParams.get("limit");
  const limit = limitRaw ? Number(limitRaw) : undefined;
  if (limit !== undefined && (!Number.isFinite(limit) || limit < 1)) {
    return errorResponse("VALIDATION_FAILED", "limit은 양의 정수여야 합니다");
  }

  try {
    const body: ListDiariesResponse = await listDiariesForPet(supabase, {
      petId,
      cursor,
      limit,
    });
    return NextResponse.json(body);
  } catch (e) {
    return errorResponse(
      "INTERNAL_ERROR",
      e instanceof Error ? e.message : "일기 조회 실패",
    );
  }
}
