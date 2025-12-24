"use client";

import { ArrowLeft, Copy, Inbox, Mail, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

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

type PaginationItem = number | "ellipsis";

export function InboxClient({
  address,
  initialPage,
}: {
  address: string;
  initialPage: EmailPage;
}) {
  const tInbox = useTranslations("Inbox");
  const tTime = useTranslations("Time");
  const locale = useLocale();
  const [emails, setEmails] = useState<Email[]>(initialPage.items);
  const [page, setPage] = useState<number>(initialPage.page);
  const [total, setTotal] = useState<number>(initialPage.total);
  const [totalPages, setTotalPages] = useState<number>(initialPage.totalPages);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  const pageSize = 20;

  const syncUrl = (nextPage: number) => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.set("page", String(nextPage));
    window.history.replaceState(null, "", url);
  };

  const fetchEmails = async (targetPage = page) => {
    setIsRefreshing(true);
    try {
      const url = `/api/emails/${encodeURIComponent(address)}?page=${targetPage}&pageSize=${pageSize}&t=${Date.now()}`;
      const response = await fetch(url, { cache: "no-store" });
      const data = await response.json();
      const result = data as EmailPage;
      setEmails(result.items);
      setTotal(result.total);
      setTotalPages(result.totalPages);
      setPage(result.page);
      syncUrl(result.page);
    } catch (error) {
      console.error("Error fetching emails:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (autoRefresh) {
      fetchEmails(page);
      const interval = setInterval(() => fetchEmails(page), 3000);
      return () => clearInterval(interval);
    }
  }, [address, autoRefresh, page]);

  useEffect(() => {
    // ページ移動時は即時取得（autoRefreshオフでも更新）
    if (!autoRefresh) {
      fetchEmails(page);
    }
  }, [page, autoRefresh]);

  const goToPage = (nextPage: number) => {
    const clamped = Math.max(1, Math.min(totalPages || 1, nextPage));
    setPage(clamped);
    syncUrl(clamped);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return tTime("justNow");
    if (minutes < 60) return tTime("minutesAgo", { count: minutes });
    if (minutes < 1440)
      return tTime("hoursAgo", { count: Math.floor(minutes / 60) });

    return new Intl.DateTimeFormat(locale).format(date);
  };

  const getPaginationItems = (
    currentPage: number,
    pageCount: number,
  ): PaginationItem[] => {
    if (pageCount <= 1) return [1];
    if (pageCount <= 7) {
      return Array.from({ length: pageCount }, (_, i) => i + 1);
    }

    if (currentPage <= 3) {
      return [1, 2, 3, 4, "ellipsis", pageCount];
    }

    if (currentPage >= pageCount - 2) {
      return [
        1,
        "ellipsis",
        pageCount - 3,
        pageCount - 2,
        pageCount - 1,
        pageCount,
      ];
    }

    return [
      1,
      "ellipsis",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "ellipsis",
      pageCount,
    ];
  };

  return (
    <main className="min-h-dvh">
      <div className="mx-auto w-full max-w-5xl px-4 py-10">
        <div className="space-y-6">
          {/* Header Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Inbox className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-xl">{tInbox("title")}</CardTitle>
                </div>
                <Button
                  onClick={() => router.push(`/${locale}`)}
                  variant="ghost"
                  size="sm"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {tInbox("back")}
                </Button>
              </div>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={address}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    onClick={handleCopy}
                    variant={copied ? "default" : "outline"}
                    size="icon"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                {copied && (
                  <p className="text-xs text-muted-foreground">
                    {tInbox("copied")}
                  </p>
                )}

                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="autoRefresh"
                      checked={autoRefresh}
                      onCheckedChange={(checked) =>
                        setAutoRefresh(Boolean(checked))
                      }
                    />
                    <label
                      htmlFor="autoRefresh"
                      className="text-sm text-muted-foreground cursor-pointer"
                    >
                      {tInbox("autoRefresh")}
                    </label>
                  </div>

                  <Separator orientation="vertical" className="h-4" />

                  <Button
                    onClick={() => fetchEmails(page)}
                    variant="ghost"
                    size="sm"
                    disabled={isRefreshing}
                  >
                    <RefreshCw
                      className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                    />
                    {tInbox("refresh")}
                  </Button>

                  <Badge variant="secondary" className="ml-auto">
                    {tInbox("emailCount", { count: total })}
                  </Badge>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Email List */}
          <Card>
            {emails.length === 0 ? (
              <CardContent className="py-16">
                <div className="text-center space-y-3">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted">
                    <Mail className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-lg font-medium text-muted-foreground">
                    {tInbox("empty")}
                  </p>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    {tInbox.rich("sendHint", {
                      email: (chunks) => (
                        <span className="font-mono font-semibold">
                          {chunks}
                        </span>
                      ),
                      address,
                    })}
                  </p>
                </div>
              </CardContent>
            ) : (
              <div className="divide-y dark:divide-slate-800">
                {emails.map((email) => (
                  <div
                    key={email.id}
                    onClick={() =>
                      router.push(
                        `/${locale}/inbox/${encodeURIComponent(address)}/${email.id}`,
                      )
                    }
                    className="p-5 hover:bg-muted/50 cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1 min-w-0 space-y-1">
                        <h3 className="font-semibold text-base truncate">
                          {email.subject}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {tInbox("from")}: {email.from}
                        </p>
                      </div>
                      <Badge variant="outline" className="whitespace-nowrap">
                        {formatDate(email.date)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {email.text.substring(0, 200)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav
              aria-label="Pagination"
              className="flex items-center justify-between gap-3"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1}
              >
                {tInbox("previous")}
              </Button>

              <div className="flex items-center gap-1">
                <span className="sr-only">
                  {tInbox("pageOf", { page, totalPages })}
                </span>
                {getPaginationItems(page, totalPages).map((item, idx) => {
                  if (item === "ellipsis") {
                    return (
                      <span
                        key={`ellipsis-${idx}`}
                        className="px-2 text-sm text-muted-foreground"
                        aria-hidden="true"
                      >
                        …
                      </span>
                    );
                  }

                  const isCurrent = item === page;
                  return (
                    <Button
                      key={item}
                      variant={isCurrent ? "default" : "outline"}
                      size="sm"
                      onClick={() => goToPage(item)}
                      aria-current={isCurrent ? "page" : undefined}
                      className="min-w-8 px-3"
                    >
                      {item}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => goToPage(page + 1)}
                disabled={page >= totalPages}
              >
                {tInbox("next")}
              </Button>
            </nav>
          )}
        </div>
      </div>
    </main>
  );
}
