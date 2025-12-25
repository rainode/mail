import { redirect } from "@/i18n/navigation";
import { defaultLocale } from "@/i18n/routing";

export default async function InboxPage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = await params;
  redirect({
    href: `/inbox/${encodeURIComponent(address)}`,
    locale: defaultLocale || "en",
  });
}
