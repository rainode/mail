import { unstable_noStore as noStore } from "next/cache";
import { notFound } from "next/navigation";
import { EmailDetailClient } from "@/components/email-detail-client";
import { mailStorage } from "@/lib/mail-storage";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

export default async function EmailDetailPage({
  params,
}: {
  params: Promise<{ locale: string; address: string; id: string }>;
}) {
  noStore();

  const { address, id } = await params;
  const decodedAddress = decodeURIComponent(address);

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
