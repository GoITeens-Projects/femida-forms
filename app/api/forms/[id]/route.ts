import { NextRequest, NextResponse } from 'next/server'
import { getFormById, updateForm, deleteForm } from '@/lib/db'
import { getSession, isAdmin } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const form = await getFormById(id)
  
  if (!form) {
    return NextResponse.json({ error: 'Form not found' }, { status: 404 })
  }

  return NextResponse.json(form)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  
  if (!session || !isAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const body = await request.json()
    const form = await updateForm(id, body)
    
    if (!form) {
      return NextResponse.json({ error: 'Failed to update form' }, { status: 500 })
    }

    return NextResponse.json(form)
  } catch (error) {
    console.error('Update form error:', error)
    return NextResponse.json({ error: 'Failed to update form' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  
  if (!session || !isAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const success = await deleteForm(id)
  
  if (!success) {
    return NextResponse.json({ error: 'Failed to delete form' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
