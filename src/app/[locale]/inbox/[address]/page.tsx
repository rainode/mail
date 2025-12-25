import { unstable_noStore as noStore } from "next/cache";
import { InboxClient } from "@/components/inbox-client";
import { mailStorage } from "@/lib/mail-storage";

type Email = {
  id: string;
  to: string;
  from: string;
  subject: string;
  text: string;
  html: string | false;
  date: string;
};

type EmailPage = {
  items: Email[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export default async function InboxPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; address: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  noStore();

  const { address } = await params;
  const decodedAddress = decodeURIComponent(address);

  const sp = (await searchParams) ?? {};
  const pageParam = Array.isArray(sp.page) ? sp.page[0] : sp.page;
  const page = Number(pageParam ?? "1");
  const pageSize = 20;

  const result = await mailStorage.getEmailsPage(
    decodedAddress,
    page,
    pageSize,
  );
  const initialPage: EmailPage = {
    ...result,
    items: result.items.map((email) => ({
      ...email,
      date: email.date.toISOString(),
    })) as Email[],
  };

  return <InboxClient address={decodedAddress} initialPage={initialPage} />;
}
