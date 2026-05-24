import EditFormPageClient from './edit-form-client'

interface EditFormPageProps {
  params: Promise<{ id: string }>
}

export default async function EditFormPage({ params }: EditFormPageProps) {
  const { id } = await params
  return <EditFormPageClient formId={id} />
}
