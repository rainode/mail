import { EmailDetailClient } from "@/components/email-detail-client";
import { redirect } from "@/i18n/navigation";
import { mailStorage } from "@/lib/mail-storage";
import { unstable_noStore as noStore } from "next/cache";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

export default async function EmailDetailPage({
  params,
}: {
  params: Promise<{ locale: string; address: string; id: string }>;
}) {
  noStore();

  const { locale, address, id } = await params;
  const decodedAddress = decodeURIComponent(address);

  if (decodedAddress.endsWith("@rainode.com")) {
    redirect({ href: "/", locale });
  }

  const email = await mailStorage.getEmail(decodedAddress, id);

  if (!email) {
    notFound();
  }

  const emailData = {
    ...email,
    date: email.date.toISOString(),
  };

  return <EmailDetailClient address={decodedAddress} email={emailData} />;
}
