import FormPageClient from './form-page-client'

interface FormPageProps {
  params: Promise<{ id: string }>
}

export default async function FormPage({ params }: FormPageProps) {
  const { id } = await params
  return <FormPageClient formId={id} />
}
