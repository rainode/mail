import { redirect } from "@/i18n/navigation";
import { defaultLocale } from "@/i18n/routing";

export default async function EmailDetailPage({
  params,
}: {
  params: Promise<{ address: string; id: string }>;
}) {
  const { address, id } = await params;
  redirect({
    href: `/inbox/${encodeURIComponent(address)}/${encodeURIComponent(id)}`,
    locale: defaultLocale || "en",
  });
}
