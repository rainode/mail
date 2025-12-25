import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-md bg-muted p-4 text-xs leading-relaxed">
      <code className="font-mono">{children}</code>
    </pre>
  );
}

export default async function ApiDocsPage() {
  const t = await getTranslations("ApiDocs");

  return (
    <main className="min-h-dvh">
      <div className="mx-auto w-full max-w-5xl px-4 py-12">
        <div className="space-y-8">
          <header className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              {t("title")}
            </h1>
            <p className="max-w-2xl text-muted-foreground">{t("subtitle")}</p>
            <p className="text-sm text-muted-foreground">
              <Link href="./" className="underline underline-offset-4">
                {t("backHome")}
              </Link>
            </p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>{t("overviewTitle")}</CardTitle>
              <CardDescription>{t("overviewDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="space-y-1">
                <div className="font-medium">{t("baseUrlTitle")}</div>
                <div className="text-muted-foreground">{t("baseUrlDesc")}</div>
              </div>

              <Separator />

              <div className="space-y-1">
                <div className="font-medium">{t("addressEncodingTitle")}</div>
                <div className="text-muted-foreground">{t("addressEncodingDesc")}</div>
                <CodeBlock>
                  {`encodeURIComponent("test@example.com") -> "test%40example.com"`}
                </CodeBlock>
              </div>

              <Separator />

              <div className="space-y-1">
                <div className="font-medium">{t("retentionTitle")}</div>
                <div className="text-muted-foreground">{t("retentionDesc")}</div>
              </div>
            </CardContent>
          </Card>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">
              {t("endpointsTitle")}
            </h2>

            <Card>
              <CardHeader className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">GET</Badge>
                  <CardTitle className="text-base font-semibold">
                    /api/emails/:address
                  </CardTitle>
                </div>
                <CardDescription>{t("listDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="space-y-2">
                  <div className="font-medium">{t("query")}</div>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>
                      <span className="font-mono">page</span> — {t("pageQuery")}
                    </li>
                    <li>
                      <span className="font-mono">pageSize</span> — {t("pageSizeQuery")}
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <div className="font-medium">{t("response")}</div>
                  <CodeBlock>
                    {`{
  "items": [
    {
      "id": "uuid",
      "to": "test@rainode.site",
      "from": "sender@rainode.site",
      "subject": "(no subject)",
      "text": "...",
      "html": "..." | false,
      "date": "2025-12-25T12:34:56.789Z",
      "raw": "(RFC822 raw source)"
    }
  ],
  "total": 1,
  "page": 1,
  "pageSize": 20,
  "totalPages": 1
}`}
                  </CodeBlock>
                </div>

                <div className="space-y-2">
                  <div className="font-medium">{t("example")}</div>
                  <CodeBlock>
                    {`curl "https://mail.rainode.com/api/emails/test%40example.site?page=1&pageSize=20"`}
                  </CodeBlock>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">GET</Badge>
                  <CardTitle className="text-base font-semibold">
                    /api/emails/:address/:id
                  </CardTitle>
                </div>
                <CardDescription>{t("detailDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="space-y-2">
                  <div className="font-medium">{t("responses")}</div>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>
                      <span className="font-mono">200</span> — {t("detail200")}
                    </li>
                    <li>
                      <span className="font-mono">404</span> — {t("detail404")}
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <div className="font-medium">{t("example")}</div>
                  <CodeBlock>
                    {`curl "https://mail.rainode.com/api/emails/test%40rainode.com/EMAIL_ID"`}
                  </CodeBlock>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </main>
  );
}
