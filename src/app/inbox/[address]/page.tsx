import { redirect } from "next/navigation";
import { defaultLocale } from "@/i18n/routing";

export default async function InboxPage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = await params;
  redirect(`/${defaultLocale}/inbox/${encodeURIComponent(address)}`);
}
