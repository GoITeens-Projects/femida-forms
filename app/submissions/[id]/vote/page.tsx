import { getContestByFormId, getSubmissionsByFormId } from "@/lib/db";
import SubmissionVotePageClient from "./submission-vote-page-client";
import { redirect } from "next/navigation";

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
