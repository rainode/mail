import type { NextRequest } from "next/server";
import { mailStorage } from "@/lib/mail-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ address: string; id: string }> },
) {
  const { address, id } = await params;
  const decodedAddress = decodeURIComponent(address);

  const email = await mailStorage.getEmail(decodedAddress, id);

  if (!email) {
    return Response.json({ error: "Email not found" }, { status: 404 });
  }

  return Response.json(email, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
