"use client";

import { ArrowLeft, Home, MailX } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NotFound() {
  const router = useRouter();

  return (
    <main className="min-h-dvh">
      <div className="mx-auto flex min-h-dvh w-full max-w-md items-center justify-center px-4 py-10">
        <Card className="w-full">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MailX className="h-5 w-5" />
              <span className="text-sm">Not found</span>
            </div>
            <CardTitle className="text-xl">Email not found</CardTitle>
            <CardDescription>
              The email doesn't exist or has been automatically deleted.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full" size="lg">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Link>
            </Button>
            <Button
              variant="outline"
              className="w-full"
              size="lg"
              onClick={() => router.back()}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
