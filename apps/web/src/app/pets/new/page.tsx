"use client";

import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PetForm } from "@/components/pet-form";
import { SiteHeader } from "@/components/site-header";
import { createPet } from "@/lib/api/pets";

export default function NewPetPage() {
  const router = useRouter();

  return (
    <main className="flex flex-1 flex-col">
      <SiteHeader />

      <div className="mx-auto flex w-full max-w-lg flex-1 items-start px-4 py-12 sm:px-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-xl">새 펫 추가</CardTitle>
            <CardDescription>
              이름과 종, 호칭을 알려주세요. 호칭은 일기에서 반려동물이 당신을
              부르는 말이에요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PetForm
              submitLabel="등록"
              onSubmit={async (input) => {
                await createPet(input);
                router.replace("/");
                router.refresh();
              }}
            />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
