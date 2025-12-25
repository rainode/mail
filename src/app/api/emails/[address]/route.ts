import { mailStorage } from "@/lib/mail-storage";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> },
) {
  const { address } = await params;
  const decodedAddress = decodeURIComponent(address);

  if (decodedAddress.endsWith("@rainode.com")) {
    return Response.json(
      JSON.stringify({ message: "This domain is currently not available." }),
      { status: 400 },
    );
  }

  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? "20");

  const result = await mailStorage.getEmailsPage(
    decodedAddress,
    page,
    pageSize,
  );
  const payload = {
    ...result,
    items: result.items.map((email) => ({
      ...email,
      date: email.date.toISOString(),
    })),
  };

  return Response.json(payload, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
