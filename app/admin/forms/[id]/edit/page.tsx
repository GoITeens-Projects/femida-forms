import { getContestByFormId } from "@/lib/db";
import EditFormPageClient from "./edit-form-client";

interface EditFormPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditFormPage({ params }: EditFormPageProps) {
  const { id } = await params;
  const contestId = (await getContestByFormId(id))?.id;

  return <EditFormPageClient formId={id} contestId={contestId} />;
}
