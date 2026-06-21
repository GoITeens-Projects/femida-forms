import { getContestByFormId, getSubmissionsByFormId } from "@/lib/db";
import SubmissionVotePageClient from "./submission-vote-page-client";
import { redirect } from "next/navigation";
import { isPast, parseISO } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, ClockAlert } from "lucide-react";
import { format, toZonedTime } from "date-fns-tz";
import { uk } from "date-fns/locale";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface SubmissionVotePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ formId: string }>;
}

export default async function SubmissionVotePage({
  params,
  searchParams,
}: SubmissionVotePageProps) {
  const { id } = await params;
  const { formId } = await searchParams;

  if (!formId) redirect("/");

  const contest = await getContestByFormId(formId);

  if (!contest)
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl text-center">Голосування не знайдено</h1>
      </div>
    );

  if (isPast(new Date(contest.ends_at)))
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="mx-auto max-w-md">
          <CardHeader className="text-center">
            <ClockAlert className="mx-auto mb-4 h-12 w-12" />
            <CardTitle>На жаль, голосування вже закінчено</CardTitle>
            <CardDescription>
              Воно закрилось{" "}
              {format(
                toZonedTime(parseISO(contest.ends_at), "Europe/Kyiv"),
                "d MMMM yyyy 'о' HH:mm",
                { locale: uk },
              )}
              . <br /> Віддати свій голос вже неможливо
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
  const allFormSubmissions = await getSubmissionsByFormId(formId);
  const currentSubmission = allFormSubmissions.find((sub) => sub.id === id);
  if (!currentSubmission)
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl text-center">
          Дана відповідь не належить цій формі
        </h1>
      </div>
    );
  if (!allFormSubmissions)
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl text-center">Йой! Напевно сталась помилка</h1>
        <p className="text-lg">Не вдалося отримати відповіді на цю форму</p>
      </div>
    );
  const participantName = contest.hide_participants_names
    ? `Учасник №${allFormSubmissions.findIndex((e) => e.id === id) + 1}`
    : currentSubmission.user.username;
  return (
    <SubmissionVotePageClient
      participantName={participantName}
      formId={formId}
      formTitle={contest.form?.title}
      submissionId={currentSubmission.id}
    />
  );
}
