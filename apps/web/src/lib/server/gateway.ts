// BFF → AI Gateway 호출. ADR-0006: X-Internal-Secret + 사용자 JWT forward.
// Gateway endpoint: POST /diary/generate, /diary/regenerate.

import type {
  GatewayGenerateRequest,
  GatewayGenerateResponse,
  GatewayRegenerateRequest,
  GatewayRegenerateResponse,
} from "@cat-dog-diary/shared-types";

export class GatewayError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "GatewayError";
  }
}

async function callGateway<TReq, TRes>(
  path: string,
  body: TReq,
  accessToken: string,
): Promise<TRes> {
  const baseUrl = process.env.AI_GATEWAY_URL;
  const secret = process.env.INTERNAL_SHARED_SECRET;
  if (!baseUrl || !secret) {
    throw new GatewayError(
      "AI_GATEWAY_URL / INTERNAL_SHARED_SECRET env 누락",
      500,
    );
  }

  let res: Response;
  try {
    res = await fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Secret": secret,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch (e) {
    throw new GatewayError(
      `Gateway 연결 실패: ${e instanceof Error ? e.message : "unknown"}`,
      502,
    );
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new GatewayError(
      `Gateway ${res.status}: ${text.slice(0, 200)}`,
      res.status,
    );
  }
  return (await res.json()) as TRes;
}

export function gatewayGenerate(
  body: GatewayGenerateRequest,
  accessToken: string,
): Promise<GatewayGenerateResponse> {
  return callGateway("/diary/generate", body, accessToken);
}

export function gatewayRegenerate(
  body: GatewayRegenerateRequest,
  accessToken: string,
): Promise<GatewayRegenerateResponse> {
  return callGateway("/diary/regenerate", body, accessToken);
}
