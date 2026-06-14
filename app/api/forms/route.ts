import { NextRequest, NextResponse } from "next/server";
import { createContest, createForm, getAllForms } from "@/lib/db";
import { getSession, isAdmin } from "@/lib/auth";
import { getFormsByUserSubmissions } from "@/lib/db";
import { FormField } from "@/lib/types";

export async function GET(request: NextRequest) {
  if (request.nextUrl.searchParams.has("submitted")) {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const submittedForms = await getFormsByUserSubmissions(session.id);
    return NextResponse.json(submittedForms);
  }
  const forms = await getAllForms();
  return NextResponse.json(forms);
}

export async function POST(request: NextRequest) {
  const session = await getSession();

  if (!session || !isAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, description, fields, expires_at, contest } = body;

    if (!title || !fields) {
      return NextResponse.json(
        { error: "Title and fields are required" },
        { status: 400 },
      );
    }

    const form = await createForm({
      title,
      description,
      fields,
      expires_at,
    });

    if (!form) {
      return NextResponse.json(
        { error: "Failed to create form" },
        { status: 500 },
      );
    }

    return NextResponse.json(form);
  } catch (error) {
    console.error("Create form error:", error);
    return NextResponse.json(
      { error: "Failed to create form" },
      { status: 500 },
    );
  }
}
