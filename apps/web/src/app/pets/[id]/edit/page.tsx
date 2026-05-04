import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SiteHeader } from "@/components/site-header";
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
    <main className="flex flex-1 flex-col">
      <SiteHeader />

      <div className="mx-auto flex w-full max-w-lg flex-1 items-start px-4 py-12 sm:px-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-xl">{pet.name} 정보 수정</CardTitle>
          </CardHeader>
          <CardContent>
            <EditPetClient pet={pet} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
