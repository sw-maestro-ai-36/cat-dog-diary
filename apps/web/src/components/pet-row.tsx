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
    <section className="flex w-full flex-col gap-4">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl" aria-hidden>
            {emoji}
          </span>
          <h2 className="text-2xl font-semibold tracking-tight">{pet.name}</h2>
          <span className="text-base text-muted-foreground">
            {pet.honorific}
            {genderMark ? ` · ${genderMark}` : ""}
          </span>
        </div>
        <PetRowMenu petId={pet.id} petName={pet.name} />
      </header>

      <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 [scrollbar-width:thin]">
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
    "flex w-56 shrink-0 flex-col items-center justify-center gap-3 rounded-2xl border text-sm font-medium aspect-square";

  if (disabled) {
    return (
      <div
        className={cn(
          baseClass,
          "cursor-not-allowed border-border/30 bg-muted/30 text-muted-foreground/50",
        )}
        aria-disabled
        title="오늘 새 일기 한도(5회)를 모두 썼어요. 자정에 초기화돼요."
      >
        <span className="text-6xl leading-none">+</span>
        <span className="text-sm">오늘 한도 끝</span>
      </div>
    );
  }

  return (
    <Link
      href={{ pathname: "/diaries/new", query: { pet_id: petId } }}
      className={cn(
        baseClass,
        "border-border/40 bg-muted/30 text-foreground transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card hover:text-primary hover:shadow-md",
      )}
    >
      <span className="text-6xl leading-none">+</span>
      <span className="text-sm">새 일기</span>
    </Link>
  );
}
