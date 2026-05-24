import { NextRequest, NextResponse } from 'next/server'
import { getSubmissionByUserAndForm } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  
  if (!session) {
    return NextResponse.json({ submitted: false })
  }

  const { id } = await params
  const submission = await getSubmissionByUserAndForm(session.id, id)
  
  return NextResponse.json({ submitted: !!submission })
}
