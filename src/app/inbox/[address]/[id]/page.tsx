import { redirect } from "next/navigation";
import { defaultLocale } from "@/i18n/routing";

export default async function EmailDetailPage({
  params,
}: {
  params: Promise<{ address: string; id: string }>;
}) {
  const { address, id } = await params;
  redirect(`/${defaultLocale}/inbox/${encodeURIComponent(address)}/${id}`);
}
