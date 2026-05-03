import type {
  AdoptDiaryRequest,
  AdoptDiaryResponse,
  GenerateRequest,
  GenerateResponse,
  ListDiariesResponse,
  RegenerateRequest,
  RegenerateResponse,
} from "@cat-dog-diary/shared-types";

async function unwrap<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error?.message ?? `HTTP ${res.status}`);
  }
  return res.json();
}

export async function generateDiary(
  input: GenerateRequest,
): Promise<GenerateResponse> {
  const res = await fetch("/api/diaries/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return unwrap<GenerateResponse>(res);
}

export async function regenerateDiary(
  input: RegenerateRequest,
): Promise<RegenerateResponse> {
  const res = await fetch("/api/diaries/regenerate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return unwrap<RegenerateResponse>(res);
}

export async function adoptDiary(
  input: AdoptDiaryRequest,
): Promise<AdoptDiaryResponse> {
  const res = await fetch("/api/diaries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return unwrap<AdoptDiaryResponse>(res);
}

export async function deleteDiary(id: string): Promise<void> {
  const res = await fetch(`/api/diaries/${id}`, { method: "DELETE" });
  if (!res.ok && res.status !== 204) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error?.message ?? `HTTP ${res.status}`);
  }
}

export async function listDiaries(
  petId: string,
  cursor?: string,
  limit?: number,
): Promise<ListDiariesResponse> {
  const params = new URLSearchParams({ petId });
  if (cursor) params.set("cursor", cursor);
  if (limit !== undefined) params.set("limit", String(limit));
  const res = await fetch(`/api/diaries?${params.toString()}`);
  return unwrap<ListDiariesResponse>(res);
}
