import { mailStorage } from "@/lib/mail-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const raw = await req.text();

    const email = await mailStorage.addEmail(raw);

    return new Response("ok", { status: 200 });
  } catch (error) {
    console.error("Error processing email:", error);
    return new Response("error", { status: 500 });
  }
}
