import Link from "next/link";
import type { Diary, Pet } from "@cat-dog-diary/shared-types";
import { cn } from "@/lib/utils";
import { normalizeSpecies } from "@/lib/species";
import { DiaryCard } from "@/components/diary-card";
import { PetRowMenu } from "@/components/pet-row-menu";

interface PetRowProps {
  pet: Pet;
  diaries: Diary[];
  newRemaining: number;
}

const GENDER_LABEL: Record<Pet["gender"], string> = {
  male: "♂",
  female: "♀",
  unknown: "",
};

export function PetRow({ pet, diaries, newRemaining }: PetRowProps) {
  const emoji = normalizeSpecies(pet.species);
  const genderMark = GENDER_LABEL[pet.gender];
  const canCreate = newRemaining > 0;

  return (
    <section className="flex w-full max-w-3xl flex-col gap-2">
      <header className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden>
            {emoji}
          </span>
          <h2 className="text-base font-semibold">{pet.name}</h2>
          <span className="text-sm text-muted-foreground">
            {pet.honorific}
            {genderMark ? ` · ${genderMark}` : ""}
          </span>
        </div>
        <PetRowMenu petId={pet.id} petName={pet.name} />
      </header>

      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
        <NewDiaryCard petId={pet.id} disabled={!canCreate} />
        {diaries.map((d) => (
          <DiaryCard key={d.id} diary={d} />
        ))}
      </div>
    </section>
  );
}

function NewDiaryCard({
  petId,
  disabled,
}: {
  petId: string;
  disabled: boolean;
}) {
  const baseClass =
    "flex w-40 shrink-0 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed text-sm font-medium transition-colors aspect-square";

  if (disabled) {
    return (
      <div
        className={cn(
          baseClass,
          "cursor-not-allowed border-border/60 bg-muted/30 text-muted-foreground/60",
        )}
        aria-disabled
        title="오늘 새 일기 한도(5회)를 모두 썼어요. 자정에 초기화돼요."
      >
        <span className="text-3xl leading-none">+</span>
        <span className="text-xs">오늘 한도 끝</span>
      </div>
    );
  }

  return (
    <Link
      href={{ pathname: "/diaries/new", query: { pet_id: petId } }}
      className={cn(
        baseClass,
        "border-border bg-background text-foreground hover:border-primary hover:bg-primary/5 hover:text-primary",
      )}
    >
      <span className="text-3xl leading-none">+</span>
      <span className="text-xs">새 일기</span>
    </Link>
  );
}
