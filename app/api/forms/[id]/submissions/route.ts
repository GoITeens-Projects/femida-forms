import { NextRequest, NextResponse } from "next/server";
import {
  createSubmission,
  getSubmissionByUserAndForm,
  getSubmissionsByFormId,
  getFormById,
} from "@/lib/db";
import { getSession, isAdmin } from "@/lib/auth";
import { isFormExpired } from "@/lib/utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();

  if (!session || !isAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const submissions = await getSubmissionsByFormId(id);

  return NextResponse.json(submissions);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Check if form exists
    const form = await getFormById(id);
    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    // Check if user already submitted
    const existingSubmission = await getSubmissionByUserAndForm(session.id, id);
    if (existingSubmission) {
      return NextResponse.json(
        { error: "You have already submitted this form" },
        { status: 400 },
      );
    }

    // Check if form is not expired
    const isExpired = isFormExpired(form.expires_at);

    if (isExpired) {
      return NextResponse.json(
        { error: "This form has expired" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { answers } = body;

    if (!answers) {
      return NextResponse.json(
        { error: "Answers are required" },
        { status: 400 },
      );
    }

    const submission = await createSubmission({
      form_id: id,
      user_id: session.id,
      answers,
    });

    if (!submission) {
      return NextResponse.json(
        { error: "Failed to create submission" },
        { status: 500 },
      );
    }

    return NextResponse.json(submission);
  } catch (error) {
    console.error("Create submission error:", error);
    return NextResponse.json(
      { error: "Failed to create submission" },
      { status: 500 },
    );
  }
}
