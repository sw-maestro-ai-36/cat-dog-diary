import Link from "next/link";
import { redirect } from "next/navigation";
import type { Pet } from "@cat-dog-diary/shared-types";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyStateCard } from "@/components/empty-state-card";
import { PetRow } from "@/components/pet-row";
import { listDiariesForPet } from "@/lib/server/diaries";
import { getUsageToday } from "@/lib/server/usage";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SignOutButton } from "./sign-out-button";

const PET_FIELDS =
  "id, name, species, honorific, gender, created_at, updated_at";
const ROW_DIARY_LIMIT = 12;

export default async function Home() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: petsData, error: petsError } = await supabase
    .from("pets")
    .select(PET_FIELDS)
    .order("created_at", { ascending: true });
  if (petsError) throw petsError;

  const pets = (petsData ?? []) as Pet[];

  const [usage, ...rows] = await Promise.all([
    getUsageToday(supabase),
    ...pets.map((p) =>
      listDiariesForPet(supabase, { petId: p.id, limit: ROW_DIARY_LIMIT }),
    ),
  ]);

  return (
    <main className="flex flex-1 flex-col items-center gap-8 p-6 pb-12">
      <header className="flex w-full max-w-3xl items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🐱🐶</span>
          <span className="text-lg font-semibold tracking-tight">냥멍일기</span>
        </Link>
        {pets.length > 0 ? (
          <Link
            href="/pets/new"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            + 새 펫 추가
          </Link>
        ) : null}
      </header>

      {pets.length === 0 ? (
        <EmptyStateCard />
      ) : (
        <div className="flex w-full flex-col items-center gap-8">
          {pets.map((pet, i) => (
            <PetRow
              key={pet.id}
              pet={pet}
              diaries={rows[i].items}
              newRemaining={usage.new_remaining}
            />
          ))}
        </div>
      )}

      <Card className="w-full max-w-md">
        <CardContent className="flex items-center justify-between gap-3 py-3">
          <span className="text-sm text-muted-foreground">{user.email}</span>
          <SignOutButton />
        </CardContent>
      </Card>
    </main>
  );
}
