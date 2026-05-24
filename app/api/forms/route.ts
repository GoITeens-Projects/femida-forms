import { NextRequest, NextResponse } from 'next/server'
import { createForm, getAllForms } from '@/lib/db'
import { getSession, isAdmin } from '@/lib/auth'

export async function GET() {
  const forms = await getAllForms()
  return NextResponse.json(forms)
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  
  if (!session || !isAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { title, description, fields } = body

    if (!title || !fields) {
      return NextResponse.json({ error: 'Title and fields are required' }, { status: 400 })
    }

    const form = await createForm({ title, description, fields })
    
    if (!form) {
      return NextResponse.json({ error: 'Failed to create form. 28' }, { status: 500 })
    }

    return NextResponse.json(form)
  } catch (error) {
    console.error('Create form error:', error)
    return NextResponse.json({ error: 'Failed to create form' }, { status: 500 })
  }
}
