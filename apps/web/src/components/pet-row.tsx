import Link from "next/link";
import type { Icon } from "@phosphor-icons/react";
import {
  Cat,
  Dog,
  GenderFemale,
  GenderMale,
  PawPrint,
  Plus,
} from "@phosphor-icons/react/dist/ssr";
import type { Diary, Pet } from "@cat-dog-diary/shared-types";
import { cn } from "@/lib/utils";
import { type SpeciesKind, normalizeSpecies } from "@/lib/species";
import { DiaryCard } from "@/components/diary-card";
import { PetRowMenu } from "@/components/pet-row-menu";

interface PetRowProps {
  pet: Pet;
  diaries: Diary[];
  newRemaining: number;
}

const SPECIES_ICON: Record<SpeciesKind, Icon> = {
  cat: Cat,
  dog: Dog,
  other: PawPrint,
};

const GENDER_ICON: Record<Pet["gender"], Icon | null> = {
  male: GenderMale,
  female: GenderFemale,
  unknown: null,
};

export function PetRow({ pet, diaries, newRemaining }: PetRowProps) {
  const SpeciesIcon = SPECIES_ICON[normalizeSpecies(pet.species)];
  const GenderIcon = GENDER_ICON[pet.gender];
  const canCreate = newRemaining > 0;

  return (
    <section className="flex w-full flex-col gap-4 rounded-3xl border border-border/40 bg-card/60 p-5 shadow-sm ring-1 ring-foreground/5 sm:p-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SpeciesIcon
            size={32}
            weight="duotone"
            className="text-primary"
            aria-hidden
          />
          <h2 className="text-2xl font-semibold tracking-tight">{pet.name}</h2>
          <span className="flex items-center gap-1.5 text-base text-muted-foreground">
            {pet.honorific}
            {GenderIcon ? (
              <>
                <span aria-hidden>·</span>
                <GenderIcon size={16} weight="bold" aria-hidden />
              </>
            ) : null}
          </span>
        </div>
        <PetRowMenu petId={pet.id} petName={pet.name} />
      </header>

      <div className="-mx-5 -my-2 flex gap-4 overflow-x-auto px-5 py-2 sm:-mx-6 sm:px-6 [scrollbar-width:thin]">
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
    "flex w-56 shrink-0 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed text-sm font-medium aspect-square";

  if (disabled) {
    return (
      <div
        className={cn(
          baseClass,
          "cursor-not-allowed border-border bg-transparent text-muted-foreground/50",
        )}
        aria-disabled
        title="오늘 새 일기 한도(5회)를 모두 썼어요. 자정에 초기화돼요."
      >
        <Plus size={56} weight="light" aria-hidden />
        <span className="text-sm">오늘 한도 끝</span>
      </div>
    );
  }

  return (
    <Link
      href={{ pathname: "/diaries/new", query: { pet_id: petId } }}
      className={cn(
        baseClass,
        "border-border bg-transparent text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-solid hover:border-primary hover:bg-card hover:text-primary hover:shadow-md hover:ring-1 hover:ring-foreground/5",
      )}
    >
      <Plus size={56} weight="light" aria-hidden />
      <span className="text-sm">새 일기</span>
    </Link>
  );
}
