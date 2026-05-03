import Link from "next/link";
import { redirect } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
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

  if (!user) {
    redirect("/login");
  }

  const { data: pets } = await supabase
    .from("pets")
    .select("id, name, species, honorific, gender")
    .order("created_at", { ascending: true });

  return (
    <main className="flex flex-1 flex-col items-center gap-8 p-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="text-5xl">🐱🐶</span>
        <h1 className="text-3xl font-semibold tracking-tight">냥멍일기</h1>
        <p className="text-muted-foreground">
          사진 한 장에서 시작하는 반려동물 1인칭 일기
        </p>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>내 펫 ({pets?.length ?? 0})</CardTitle>
          <CardDescription>
            Phase 4-C 검증용 — 4-D에서 row × 캐러셀로 교체.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {pets && pets.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {pets.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2 text-sm"
                >
                  <span>
                    <strong>{p.name}</strong>{" "}
                    <span className="text-muted-foreground">
                      · {p.species} · {p.honorific} ·{" "}
                      {p.gender === "male"
                        ? "♂"
                        : p.gender === "female"
                          ? "♀"
                          : "?"}
                    </span>
                  </span>
                  <Link
                    href={`/pets/${p.id}/edit`}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    수정
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              아직 펫이 없어요. 새로 추가해보세요.
            </p>
          )}

          <Link
            href="/pets/new"
            className={buttonVariants({ size: "lg", className: "w-full" })}
          >
            + 새 펫 추가
          </Link>
        </CardContent>
      </Card>

      <Card className="w-full max-w-md">
        <CardContent className="flex items-center justify-between gap-3 py-4">
          <span className="text-sm text-muted-foreground">{user.email}</span>
          <SignOutButton />
        </CardContent>
      </Card>
    </main>
  );
}
