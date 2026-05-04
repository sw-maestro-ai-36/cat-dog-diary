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
import { createPet } from "@/lib/api/pets";

export default function NewPetPage() {
  const router = useRouter();

  return (
    <main className="flex flex-1 items-center justify-center p-8">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>새 펫 추가</CardTitle>
          <CardDescription>
            이름과 종, 호칭을 알려주세요. 호칭은 일기에서 반려동물이 당신을 부르는 말이에요.
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
    </main>
  );
}
