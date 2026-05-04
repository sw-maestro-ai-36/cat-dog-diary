import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EditPetClient } from "./edit-pet-client";

type Props = { params: Promise<{ id: string }> };

export default async function EditPetPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: pet, error } = await supabase
    .from("pets")
    .select("id, name, species, honorific, gender, created_at, updated_at")
    .eq("id", id)
    .single();

  if (error || !pet) {
    notFound();
  }

  return (
    <main className="flex flex-1 items-center justify-center p-8">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>{pet.name} 정보 수정</CardTitle>
        </CardHeader>
        <CardContent>
          <EditPetClient pet={pet} />
        </CardContent>
      </Card>
    </main>
  );
}
