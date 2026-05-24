'use client'

import { useRouter } from 'next/navigation'
import { FormBuilder } from '@/components/form-builder'
import { toast } from 'sonner'

export default function NewFormPage() {
  const router = useRouter()

  const handleSave = async (formData: { title: string; description: string | null; fields: unknown[] }) => {
    try {
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create form')
      }

      toast.success('Form created successfully!')
      router.push('/admin')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create form')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create New Form</h1>
        <p className="text-muted-foreground">Design your form with custom fields</p>
      </div>
      <FormBuilder onSave={handleSave} />
    </div>
  )
}
