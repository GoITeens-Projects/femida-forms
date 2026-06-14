"use client";
import { useState, useEffect } from "react";
import { Thumbmark } from "@thumbmarkjs/thumbmarkjs";
import { ClientFingerprint } from "@/lib/types";
import { useVisitorData } from "@fingerprint/react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, CheckCircle2, Flame } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import confetti from "canvas-confetti";

interface SubmissionVotePageClientProps {
  formId: string;
  formTitle?: string;
  submissionId: string;
  participantName: string;
}

export default function SubmissionVotePageClient({
  formId,
  formTitle,
  submissionId,
  participantName,
}: SubmissionVotePageClientProps) {
  const router = useRouter();
  const [fingerprint, setFingerprint] =
    useState<Partial<ClientFingerprint> | null>(null);
  const {
    isLoading: isFpLoading,
    error,
    data,
  } = useVisitorData({ immediate: true });
  useEffect(() => {
    if (isFpLoading || !data?.visitor_id) return;
    setFingerprint((prev) => ({ ...prev, visitorId: data.visitor_id }));
  }, [isFpLoading, data?.visitor_id]);
  useEffect(() => {
    async function getFingerprint() {
      try {
        const t = new Thumbmark({
          api_key: process.env.NEXT_THUMBMARK_API_KEY,
        });
        const tm_data = await t.get();

        const c = tm_data.components as any;
        const physicalWidth = Math.round(
          window.screen.width * window.devicePixelRatio,
        );
        const physicalHeight = Math.round(
          window.screen.height * window.devicePixelRatio,
        );
        const clientFingerprint: Partial<ClientFingerprint> = {
          audio_hash: String(c.audio?.sampleHash ?? "unknown"),
          canvas_hash: String(c.webgl.commonPixelsHash ?? "unknown"),
          gpu: {
            vendor: String(c.hardware?.videocard?.vendor ?? "unknown"),
            renderer: String(c.hardware?.videocard?.renderer ?? "unknown"),
          },
          screen: `${physicalWidth}x${physicalHeight}x${window.screen.colorDepth}@${window.devicePixelRatio.toFixed(4)}`,
          timezone: String(c.locales?.timezone ?? "unknown"),
          languages: Array.isArray(c.locales.languages)
            ? c.locales.languages.join("; ")
            : String(c.locales.languages ?? "unknown"),
        };
        setFingerprint((prev) => ({ ...prev, ...clientFingerprint }));
      } catch {}
    }

    getFingerprint();
  }, []);

  const [isLoading, setIsLoading] = useState(true);
  const [isVoting, setIsVoting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  useEffect(() => {
    async function checkVote() {
      try {
        const res = await fetch(
          `/api/forms/${formId}/submissions/${submissionId}/check-vote`,
        );
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (data.submitted) setAlreadySubmitted(true);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Не вдалося здійснити перевірку",
        );
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    }

    checkVote();
  }, [formId, submissionId]);

  const handleVote = async () => {
    try {
      setIsVoting(true);
      const res = await fetch(
        `/api/forms/${formId}/submissions/${submissionId}/vote`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fingerprint }),
        },
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Не вдалося зарахувати голос");
      }
      setSubmitted(true);
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Не вдалося зарахувати голос",
      );
    } finally {
      setIsVoting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="mx-auto max-w-md">
          <CardHeader className="text-center">
            <Skeleton className="h-6 w-48 mx-auto mb-2" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted || alreadySubmitted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="mx-auto max-w-md">
          <CardHeader className="text-center">
            <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-500" />
            <CardTitle>
              {submitted ? "Голос зараховано!" : "Вже зараховано"}
            </CardTitle>
            <CardDescription>
              {submitted
                ? "Дякуємо за твій голос. Він вже зарахований і обов'язково допоможе визначити переможця"
                : "Ти залишив свій голос, дякуємо"}
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
      <Card className="mx-auto max-w-md">
        <CardHeader className="text-center">
          {formTitle && <CardTitle>{formTitle}</CardTitle>}
          <CardDescription>
            Ви хочете віддати свій голос за{" "}
            <span className="font-bold">{participantName}</span>?
          </CardDescription>
        </CardHeader>

        <CardContent className="grid grid-cols-2 gap-4">
          <Link href="/">
            <Button variant="outline" className="w-full">
              <ArrowLeft />
              Повернутись
            </Button>
          </Link>
          <Button onClick={handleVote} disabled={isVoting} className="w-full">
            <Flame />
            Так, хочу
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
