import NewFormPageClient from "./new-form-client";

interface NewFormPageProps {
  searchParams: Promise<{ duplicateFrom?: string }>;
}

export default async function NewFormPage({ searchParams }: NewFormPageProps) {
  const { duplicateFrom } = await searchParams;
  return <NewFormPageClient formId={duplicateFrom} />;
}
