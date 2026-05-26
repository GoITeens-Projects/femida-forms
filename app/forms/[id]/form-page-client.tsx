"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Form } from "@/lib/types";
import { FormRenderer } from "@/components/form-renderer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { CheckCircle2, ArrowLeft, LogIn, ClockAlert } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { isFormExpired } from "@/lib/utils";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { toZonedTime } from "date-fns-tz";
import { parseISO } from "date-fns";
import confetti from "canvas-confetti";

export default function FormPageClient({ formId }: { formId: string }) {
  const router = useRouter();
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [notLoggedIn, setNotLoggedIn] = useState(false);

  useEffect(() => {
    async function loadForm() {
      try {
        const res = await fetch(`/api/forms/${formId}`);
        if (!res.ok) {
          router.push("/");
          return;
        }
        const formData = await res.json();
        setForm(formData);

        // Check session
        const sessionRes = await fetch("/api/auth/session");
        const sessionData = await sessionRes.json();

        if (!sessionData.user) {
          setNotLoggedIn(true);
          setLoading(false);
          return;
        }

        // Check if already submitted
        const checkRes = await fetch(`/api/forms/${formId}/check-submission`);
        if (checkRes.ok) {
          const checkData = await checkRes.json();
          if (checkData.submitted) {
            setAlreadySubmitted(true);
          }
        }
      } catch (error) {
        console.error("Error loading form:", error);
        router.push("/");
      } finally {
        setLoading(false);
      }
    }

    loadForm();
  }, [formId, router]);

  const handleSubmit = async (
    answers: Record<string, string | string[] | boolean>,
  ) => {
    try {
      const res = await fetch(`/api/forms/${formId}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit");
      }

      setSubmitted(true);
      // toast.success("Форма успішно відправлена!");
      confetti({
        particleCount: 80,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.65 },
      });
      confetti({
        particleCount: 80,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.65 },
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to submit form",
      );
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
          <div className="mt-4 space-y-4">
            <div className="h-32 animate-pulse rounded-xl bg-muted" />
            <div className="h-32 animate-pulse rounded-xl bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  if (!form) {
    return null;
  }

  if (notLoggedIn) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="mx-auto max-w-md">
          <CardHeader className="text-center">
            <LogIn className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              Please sign in with Discord to fill out this form.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/login" className="block">
              <Button className="w-full">Sign In with Discord</Button>
            </Link>
            <Link href="/" className="block">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (alreadySubmitted || submitted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="mx-auto max-w-md">
          <CardHeader className="text-center">
            <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-500" />
            <CardTitle>
              {submitted ? "Submission Received!" : "Already Submitted"}
            </CardTitle>
            <CardDescription>
              {submitted
                ? "Thank you for your submission. Your response has been recorded."
                : "You have already submitted this form."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/" className="block">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isFormExpired(form.expires_at)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="mx-auto max-w-md">
          <CardHeader className="text-center">
            <ClockAlert className="mx-auto mb-4 h-12 w-12" />
            <CardTitle>На жаль, форма вже закрита</CardTitle>
            <CardDescription>
              Вона закрилась{" "}
              {format(
                toZonedTime(parseISO(form.expires_at!), "Europe/Kyiv"),
                "d MMMM yyyy 'о' HH:mm",
                { locale: uk },
              )}
              . <br /> Заповнити її вже неможливо
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/" className="block">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                На головну
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <FormRenderer form={form} onSubmit={handleSubmit} />
    </div>
  );
}
