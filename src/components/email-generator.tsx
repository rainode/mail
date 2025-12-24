"use client";

import { ArrowRight, Copy, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DOMAINS = [
  "rainode.site",
  "rainode.shop",
  "openaikiller.com",
  "openaikiller.site",
  "openaikiller.shop",
] as const;
type Domain = (typeof DOMAINS)[number];

function normalizeLocalPart(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const atIndex = trimmed.indexOf("@");
  return (atIndex >= 0 ? trimmed.slice(0, atIndex) : trimmed).trim();
}

function buildEmail(localOrEmail: string, domain: Domain): string {
  const local = normalizeLocalPart(localOrEmail);
  if (!local) return "";
  return `${local}@${domain}`.toLowerCase();
}

function generateRandomLocalPart(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function EmailGenerator() {
  const t = useTranslations("EmailGenerator");
  const locale = useLocale();
  const [localPart, setLocalPart] = useState("");
  const [domain, setDomain] = useState<Domain>("rainode.site");
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const fullEmail = buildEmail(localPart, domain);

  const handleGenerate = () => {
    setLocalPart(generateRandomLocalPart());
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!fullEmail) return;
    await navigator.clipboard.writeText(fullEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleViewInbox = () => {
    if (!fullEmail) return;
    router.push(`/${locale}/inbox/${encodeURIComponent(fullEmail)}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="domain" className="text-sm font-medium">
            {t("domainLabel")}
          </Label>
          <Select
            value={domain}
            onValueChange={(value) => setDomain(value as Domain)}
          >
            <SelectTrigger id="domain">
              <SelectValue placeholder={t("domainPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {DOMAINS.map((d) => (
                <SelectItem key={d} value={d}>
                  @{d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="local" className="text-sm font-medium">
            {t("addressLabel")}
          </Label>
          <div className="flex gap-2">
            <Input
              id="local"
              value={localPart}
              onChange={(e) => {
                setLocalPart(e.target.value);
                if (copied) setCopied(false);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleViewInbox()}
              placeholder={t("addressPlaceholder")}
              className="flex-1"
            />
            <Button onClick={handleGenerate} variant="outline">
              <Sparkles className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {fullEmail && (
          <div className="space-y-2">
            <Label htmlFor="full-email" className="text-sm font-medium">
              {t("emailLabel")}
            </Label>
            <div className="flex gap-2">
              <Input
                id="full-email"
                value={fullEmail}
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
              <p className="text-xs text-muted-foreground">{t("copied")}</p>
            )}
          </div>
        )}

        <Button
          onClick={handleViewInbox}
          disabled={!fullEmail}
          className="w-full"
          size="lg"
        >
          {t("viewInbox")}
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </CardContent>
    </Card>
  );
}
