// 모든 인증 페이지에서 동일 헤더 — async server component로 user/profile/첫 펫 자체 fetch.
// 호출 측은 단순 `<SiteHeader />` 한 줄.

import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { HeaderUserMenu } from "@/components/header-user-menu";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function SiteHeader() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: profileData }, { data: petsData }] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("pets")
      .select("id")
      .order("created_at", { ascending: true })
      .limit(1),
  ]);

  const displayName =
    (profileData as { display_name?: string } | null)?.display_name ??
    user.email ??
    "사용자";
  const firstPetId = (petsData as { id: string }[] | null)?.[0]?.id;

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
          {firstPetId ? (
            <Link
              href={{
                pathname: "/diaries/new",
                query: { pet_id: firstPetId },
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

        <HeaderUserMenu displayName={displayName} email={user.email ?? ""} />
      </div>
    </header>
  );
}
