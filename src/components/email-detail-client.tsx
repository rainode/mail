"use client";

import {
  ArrowLeft,
  Calendar,
  Home,
  Mail as MailIcon,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Email = {
  id: string;
  to: string;
  from: string;
  subject: string;
  text: string;
  html: string | false;
  date: string;
};

export function EmailDetailClient({
  address,
  email,
}: {
  address: string;
  email: Email;
}) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("EmailDetail");
  const [activeTab, setActiveTab] = useState(email.html ? "html" : "text");

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  return (
    <main className="min-h-dvh">
      <div className="mx-auto w-full max-w-5xl px-4 py-10">
        <div className="space-y-6">
          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              onClick={() =>
                router.push(`/${locale}/inbox/${encodeURIComponent(address)}`)
              }
              variant="ghost"
              size="sm"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("backToInbox")}
            </Button>
            <Button
              onClick={() => router.push(`/${locale}`)}
              variant="ghost"
              size="sm"
            >
              <Home className="mr-2 h-4 w-4" />
              {t("home")}
            </Button>
          </div>

          {/* Email Header */}
          <Card>
            <CardHeader className="space-y-6">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tight">
                  {email.subject}
                </h1>

                <Separator />

                <div className="grid gap-3 text-sm">
                  <div className="flex items-start gap-3">
                    <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div className="space-y-1 flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">
                        {t("from")}
                      </p>
                      <p className="font-medium truncate">{email.from}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MailIcon className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div className="space-y-1 flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">{t("to")}</p>
                      <p className="font-medium truncate">{email.to}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        {t("date")}
                      </p>
                      <p className="font-medium">{formatDate(email.date)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Email Content */}
          <Card>
            <CardContent className="pt-6">
              {email.html ? (
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="html">{t("htmlView")}</TabsTrigger>
                    <TabsTrigger value="text">{t("plainText")}</TabsTrigger>
                  </TabsList>

                  <TabsContent value="html" className="mt-6">
                    <div className="rounded-lg border bg-background overflow-hidden">
                      <iframe
                        srcDoc={email.html as string}
                        className="w-full min-h-[600px] border-0"
                        sandbox="allow-same-origin"
                        title={t("htmlTitle")}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="text" className="mt-6">
                    <div className="rounded-lg border bg-muted p-6">
                      <pre className="whitespace-pre-wrap font-mono text-sm">
                        {email.text}
                      </pre>
                    </div>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="rounded-lg border bg-muted p-6">
                  <pre className="whitespace-pre-wrap font-mono text-sm">
                    {email.text}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
