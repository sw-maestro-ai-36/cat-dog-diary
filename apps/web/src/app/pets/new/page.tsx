"use client";

import { useRouter } from "next/navigation";
import { PetForm } from "@/components/pet-form";
import { SiteHeader } from "@/components/site-header";
import { createPet } from "@/lib/api/pets";

export default function NewPetPage() {
  const router = useRouter();

  return (
    <main className="flex flex-1 flex-col">
      <SiteHeader />

      {/* Hero — deep section */}
      <section className="bg-deep text-background px-6 py-16 sm:px-10 lg:py-20">
        <div className="mx-auto max-w-[1600px]">
          <div className="mb-5 flex items-center gap-3 text-xs tracking-[0.3em] text-accent uppercase">
            <span className="h-px w-8 bg-accent" />
            <span>New Pet · Welcome</span>
          </div>
          <h1
            className="font-display text-5xl leading-[1.05] sm:text-6xl lg:text-7xl"
            style={{ letterSpacing: "-0.02em" }}
          >
            새 가족을<br />
            <span className="text-accent">등록</span>해주세요
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-background/70 sm:text-lg">
            이름과 종, 호칭을 알려주세요. 호칭은 일기에서 반려동물이 당신을 부르는 말이에요.
          </p>
        </div>
      </section>

      {/* 본문 — cream 폼 */}
      <section className="bg-background text-foreground px-6 py-16 sm:px-10 lg:py-20 flex-1">
        <div className="mx-auto w-full max-w-xl">
          <PetForm
            submitLabel="등록"
            onSubmit={async (input) => {
              await createPet(input);
              router.replace("/");
              router.refresh();
            }}
          />
        </div>
      </section>
    </main>
  );
}
