import { ArrowRight, Mail, Sparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { EmailGenerator } from "@/components/email-generator";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/i18n/navigation";

export default async function Home() {
  const t = await getTranslations("Home");

  return (
    <main className="min-h-dvh">
      <div className="mx-auto w-full max-w-5xl px-4 py-12">
        <div className="space-y-10">
          <header className="space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-5 w-5" />
              <span className="text-sm">{t("kicker")}</span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              {t("title")}
            </h1>
            <p className="max-w-2xl text-muted-foreground">{t("subtitle")}</p>
          </header>

          <EmailGenerator />

          <Link href="/api-docs" className="underline underline-offset-4 mx-4">
            API
          </Link>

          <section className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-muted-foreground" />
                  <CardTitle>{t("card1Title")}</CardTitle>
                </div>
                <CardDescription>{t("card1Desc")}</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <CardTitle>{t("card2Title")}</CardTitle>
                </div>
                <CardDescription>{t("card2Desc")}</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <CardTitle>{t("card3Title")}</CardTitle>
                </div>
                <CardDescription>{t("card3Desc")}</CardDescription>
              </CardHeader>
            </Card>
          </section>
        </div>
      </div>
    </main>
  );
}
